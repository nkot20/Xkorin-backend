const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('dotenv').config();
const authMiddleware = require('../../middlewares/authenticate.middleware');
const User = require('../../models/User');
const logger = require('../../logger');
const ROLE = require('../../config/role');
const companyRepository = require('../../repositories/companyRepository');

const timestamp = new Date();

const authController = require('../../controllers/auth/auth.controller');
const validateSchema = require('../../middlewares/validationSchema');

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.optional().default(false),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
});

const validateEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const generateAccessToken = (user) => {
  const payload = { sub: user._id };
  return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
  const payload = { sub: user._id };
  return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/login', validateSchema(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    User.findOne({ email }, (err, user) => {
      if (err) {
        logger.error('Internal server error', { error: err, timestamp });
        return res.status(500).json({ message: 'Internal server error', error: err });
      }

      if (!user) {
        logger.error(`Authentication failed. User ${email} not found`, {
          user_email: email,
          timestamp,
        });
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
      }

      user.comparePassword(password, async (err, isMatch) => {
        if (err || !isMatch) {
          logger.error(`Authentication failed. Invalid password for user ${email}`, {
            user_email: email,
            timestamp,
          });
          return res.status(401).json({ message: 'Authentication failed. Invalid password.' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        logger.info(`User ${user.email} logged successfully`, {
          pid: user.pid,
          user_email: user.email,
          timestamp,
        });
        if (hasRole(user.role, ROLE.COMPANY_ADMIN)) {
          const company = await companyRepository.getCompanyByIdUserManager(user.id)
          res.json({
            message: 'Authentication successful', accessToken, refreshToken, user, company
          });
        } else {
          res.json({
            message: 'Authentication successful', accessToken, refreshToken, user,
          });
        }
      });
    });
  } catch (err) {
    logger.error('Internal server error', { error: err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', (req, res) => {
  const {
    email, password, firstName, lastName,
  } = req.body;

  const newUser = new User({
    email, password, firstName, lastName, // first_name and last_name in database fields
  });

  newUser.save((err) => {
    if (err) {
      logger.error('Internal server error', { error: err });
      return res.status(400).json({ message: 'Registration failed', error: err });
    }

    logger.info(`Registration successful for user ${email}`, { user_email: email, timestamp });
    res.json({ message: 'Registration successful' });
  });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

router.get('/meTest', authMiddleware.authenticate, (req, res) => {
  res.json(req.user);
});

router.post('/sign-in-with-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  const accessToken = generateAccessToken(req.user);

  logger.info('Authentication with token successful', { timestamp });

  res.json({ message: 'Authentication with token successful', accessToken, user: req.user });
});

// Route to refresh the access token using the refresh token
router.post('/token/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.error('Refresh token not provided');
    return res.status(400).json({ message: 'Refresh token not provided.' });
  }

  jwt.verify(refreshToken, config.parsed.JWT_SECRET, (err, payload) => {
    if (err) {
      logger.error('Invalid refresh token.');
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    User.findById(payload.sub, (userErr, user) => {
      if (userErr) {
        logger.error('Internal server error', { error: err });
        return res.status(500).json({ message: 'Internal server error', error: err });
      }

      if (!user) {
        logger.error('Authentication failed. User not found');
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
      }

      const accessToken = generateAccessToken(user);
      logger.info('Access token refreshed successfully', { timestamp });
      res.json({ message: 'Access token refreshed successfully', accessToken });
    });
  });
});

router.post('/forgot-password', authMiddleware.authenticate, validateSchema(forgotPasswordSchema), (req, res) => {
  try {
    const { email } = req.body;

    authController.forgotPassword(email, req).then((result) => {
      logger.info(`Email sent to ${email} for password reset.`, { email });
      res.json({ message: 'Email sent', result });
    }).catch((err) => {
      logger.error(`Error sending email to ${email}`, { error: err, timestamp });
      // console.log('Error sending email', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  } catch (err) {
    logger.error('Internal server error', { error: err, timestamp });
    // console.error(err);

    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', validateSchema(resetPasswordSchema), (req, res) => {
  try {
    const { token, password } = req.body;
    authController.resetPassword(token, password).then((result) => {
      logger.info('Password reset successful', { timestamp });
      const accessToken = generateAccessToken(result);
      const refreshToken = generateRefreshToken(result);
      res.status(200).json({ message: 'Password reset successful', result, accessToken, refreshToken });
    }).catch((err) => {
      logger.error('Error resetting password', { error: err, timestamp });
      // console.log('Error resetting password', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  } catch (err) {
    logger.error('Internal server error', { error: err, timestamp });
    // console.error(err);

    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/confirm-email', validateSchema(validateEmailSchema), (req, res) => {
  try {
    const { token } = req.body;

    authController.confirmEmail(token).then((result) => {
      logger.info('Email confirmed successful', { timestamp });

      res.json({ message: 'Email confirmed successful', user: result });
    }).catch((err) => {
      logger.error('Error confriming Email', { error: err, timestamp });
      // console.log('Error resetting password', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  } catch (err) {
    logger.error('Internal server error', { error: err, timestamp });
    // console.error(err);

    res.status(500).json({ error: 'Internal server error' });
  }
});


function hasRole(roles, role) {
  // Vérifier si roles est un tableau
  if (!Array.isArray(roles)) {
    throw new Error('Le premier argument doit être un tableau.');
  }

  // Utiliser la méthode includes() pour vérifier si le rôle est présent dans le tableau
  return roles.includes(role);
}

module.exports = router;
