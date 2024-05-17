const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('../../common/NewServiceEmailSender');
const User = require('../../models/User');

const logger = require('../../logger');
const timestamp = new Date();

class AuthController {
  async forgotPassword(email, req) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        logger.error('No user found with the email ' + email);
        throw new Error('User not found');
      }

      logger.info('User with email ' + user.email + ' found', { timestamp: timestamp });

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
      // console.log('Error sending reset password email', error);
      logger.error('Error sending reset password to email ' + email, { error: error, timestamp: timestamp });
      throw error;
    }
  }

  async resetPassword(token, password) {
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });

      if (!user) {
        logger.error('No user found with the email ' + email, { timestamp: timestamp });
        throw new Error('User not found');
      }

      user.password = password;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      user.save((err) => {
        if (err) {
          logger.error('Unable to update paswword for user ' + user.email, { timestamp: timestamp });
          throw new Error('Unable to update user password');
        }
      });

      logger.info('Password reset successful for user ' + user.email, { timestamp: timestamp });
      return user;
    } catch (error) {
      logger.error('Error resetting password', error, { timestamp: timestamp });
      throw error;
    }
  }

  async confirmEmail(token) {
    try {
      const user = await User.findOne({
        validationToken: token,

      });
      if (!user) {
        logger.error('No user found', { timestamp: timestamp });
        throw new Error('User not found');
      }

      user.isValided = true;
      user.validationToken = undefined;
      user.validationExpirationToken = undefined;

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000;

      const result  = await user.save();

      if (!result) {
        logger.error('Unable to validate email for user ' + user.email, { timestamp: timestamp });
        throw new Error('Unable to validate user email');
      }

      logger.info('Email validate successful for user ' + user.email, { timestamp: timestamp });
      console.log("finish ", result)
      return result;
    } catch (error) {
      logger.error('Error validating email', error, { timestamp: timestamp });
      throw error;
    }
  }
}

const authController = new AuthController();

module.exports = authController;
