const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('dotenv').config();
const authMiddleware = require('../middlewares/authenticate.middleware');
const User = require('../models/User');
const logger = require('../logger');
const ROLE = require('../config/role');
const companyRepository = require('../repositories/CompanyRepository');
const institutionRepository = require('../repositories/InstitutionRepository');
const authService = require('../services/AuthService');
const personRepository = require('../repositories/PersonRepository');
const authController = require('../controllers/auth/auth.controller');
const validateSchema = require('../middlewares/validationSchema');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();
const timestamp = new Date();

/**
 * Validation schema for login request
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.optional().default(false),
});

/**
 * Validation schema for registration request
 */
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  company: Joi.string().required(),
  profil: Joi.string(),
  type: Joi.string().required(),
  subcategory: Joi.string().required(),
  agreements: Joi.boolean().required(),
});

/**
 * Validation schema for forgot password request
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

/**
 * Validation schema for reset password request
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
});

/**
 * Validation schema for email validation request
 */
const validateEmailSchema = Joi.object({
  token: Joi.string().required(),
});

/**
 * Generate JWT access token
 * @param {object} user - The user object
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user) => {
  const payload = { sub: user._id };
  return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Generate JWT refresh token
 * @param {object} user - The user object
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = { sub: user._id };
  return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * @route POST /sign-in
 * @desc Authenticate user and return access and refresh tokens
 * @access Public
 */
router.post('/sign-in', validateSchema(loginSchema), asyncHandler(async (req, res) => {
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
        const person = await personRepository.findPersonByEmail(user.email)
        const company = await companyRepository.getCompany(person.company_id[0]);
        let newUser = user._doc
        newUser = Object.assign({}, newUser, {
          company: company,
          person: person
        });
<<<<<<< Updated upstream
        if (hasRole(user.role, ROLE.COMPANY_ADMIN)) {
          const person = await personRepository.findPersonByEmail(user.email)
          const company = await companyRepository.getCompany(person.company_id[0]);
          let newUser = user._doc
          newUser = Object.assign({}, newUser, {
            company: company,
            person: person
          });
          return res.json({
            message: 'Authentication successful', accessToken, user: newUser
          });
        }
        if (hasRole(user.role, ROLE.INSTITUTION_ADMIN) || hasRole(user.role, ROLE.INSTITUTION_EMPLOYEE)) {
          const institution = await institutionRepository.getByAdminId(user._id);
          let newUser = user._doc
          newUser = Object.assign({}, newUser, {
            institution
          });
          return res.json({
            message: 'Authentication successful', accessToken, user: newUser
          });
        }
=======
>>>>>>> Stashed changes
        return res.json({
          message: 'Authentication successful', accessToken, user: newUser
        });
      }
      if (hasRole(user.role, ROLE.INSTITUTION_ADMIN) || hasRole(user.role, ROLE.INSTITUTION_EMPLOYEE)) {
        const institution = await institutionRepository.getByAdminId(user._id);
        let newUser = user._doc
        newUser = Object.assign({}, newUser, {
          institution
        });
        return res.json({
          message: 'Authentication successful', accessToken, user: newUser
        });
      }
      return res.json({
        message: 'Authentication successful', accessToken, refreshToken, user,
      });
    });
  });
}));




/**
 * @route POST /register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateSchema(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const newUser = new User({
    email, password, firstName, lastName,
  });

  await newUser.save();
  logger.info(`Registration successful for user ${email}`, { user_email: email, timestamp });
  res.json({ message: 'Registration successful' });
}));

/**
 * @route POST /sign-up
 * @desc Register a new user with additional data
 * @access Public
 */
router.post('/sign-up', validateSchema(registerSchema), asyncHandler(async (req, res) => {
  const person = await authService.register(req.body);
  logger.info(`Registration successful for user ${person.email}`, { user_email: person.email, timestamp });
  res.json({ message: 'Registration successful' });
}));

/**
 * @route GET /me
 * @desc Get authenticated user information
 * @access Private
 */
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

/**
 * @route GET /meTest
 * @desc Get authenticated user information using custom middleware
 * @access Private
 */
router.get('/meTest', authMiddleware.authenticate, (req, res) => {
  res.json(req.user);
});

/**
 * @route POST /sign-in-with-token
 * @desc Authenticate user with JWT token
 * @access Private
 */
router.post('/sign-in-with-token', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const user = req.user;
  logger.info('Authentication with token successful', { timestamp });

  if (hasRole(user.role, ROLE.COMPANY_ADMIN)) {
    const person = await personRepository.findPersonByEmail(user.email);
    const company = await companyRepository.getCompany(person.company_id[0]);
<<<<<<< Updated upstream
    let newUser = user;
    newUser = Object.assign({}, newUser, {
      company: company,
      person: person
    });
    return res.json({
      message: 'Authentication successful', accessToken, user: newUser
    });
=======
    const newUser = { ...user, company, person };
    return res.json({ message: 'Authentication successful', accessToken, user: newUser });
>>>>>>> Stashed changes
  }

  if (hasRole(user.role, ROLE.INSTITUTION_ADMIN) || hasRole(user.role, ROLE.INSTITUTION_EMPLOYEE)) {
    const institution = await institutionRepository.getByAdminId(user._id);
    const newUser = { ...user, institution };
    return res.json({ message: 'Authentication successful', accessToken, user: newUser });
  }

  return res.json({ message: 'Authentication successful', accessToken, user });
}));

/**
 * @route POST /token/refresh
 * @desc Refresh the access token using the refresh token
 * @access Public
 */
router.post('/token/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.error('Refresh token not provided');
    return res.status(400).json({ message: 'Refresh token not provided.' });
  }

  jwt.verify(refreshToken, config.parsed.JWT_SECRET, async (err, payload) => {
    if (err) {
      logger.error('Invalid refresh token.');
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      logger.error('Authentication failed. User not found');
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    const accessToken = generateAccessToken(user);
    logger.info('Access token refreshed successfully', { timestamp });
    res.json({ message: 'Access token refreshed successfully', accessToken });
  });
}));

/**
 * @route POST /forgot-password
 * @desc Initiate forgot password process
 * @access Public
 */
router.post('/forgot-password', validateSchema(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const result = await authController.forgotPassword(email, req);
    logger.info(`Email sent to ${email} for password reset.`, { email });
    res.json({ message: 'Email sent', result });
  } catch (err) {
    logger.error(`Error sending email to ${email}`, { error: err, timestamp });
    res.status(500).json({ error: 'Internal server error' });
  }
}));

/**
 * @route POST /reset-password
 * @desc Reset password using a token
 * @access Public
 */
router.post('/reset-password', validateSchema(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  try {
    const result = await authController.resetPassword(token, password);
    logger.info('Password reset successful', { timestamp });
    const accessToken = generateAccessToken(result);
    const refreshToken = generateRefreshToken(result);
    res.status(200).json({ message: 'Password reset successful', result, accessToken, refreshToken });
  } catch (err) {
    logger.error('Error resetting password', { error: err, timestamp });
    res.status(500).json({ error: 'Internal server error' });
  }
}));

/**
 * @route POST /confirm-email
 * @desc Confirm email using a token
 * @access Public
 */
router.post('/confirm-email', validateSchema(validateEmailSchema), asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const result = await authService.isTokenValid(token);
    logger.info('Email confirmed successfully', { timestamp });
    res.json({ message: 'Email confirmed successfully', user: result });
  } catch (err) {
    logger.error('Error confirming email', { error: err, timestamp });
    res.status(500).json({ error: 'Internal server error' });
  }
}));

/**
 * Check if the user has a specific role
 * @param {array} roles - Array of user roles
 * @param {number} role - Role to check
 * @returns {boolean} - True if the user has the role, false otherwise
 */
function hasRole(roles, role) {
  if (!Array.isArray(roles)) {
    throw new Error('Le premier argument doit être un tableau.');
  }
  return roles.includes(role);
}

module.exports = router;
