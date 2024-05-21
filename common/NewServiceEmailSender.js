require('dotenv').config();

const ejs = require('ejs');
const nodemailer = require('nodemailer');

const configMailHog = {
  host: process.env.MAIL_HOST, // WEB UI LOCALHOST 8025
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

class EmailSender {
  constructor() {
    const { host, port, auth } = configMailHog;

    const config = {
      host,
      port,
      secure: false,
      ignoreTLS: true,
    };

    if (auth.user && auth.pass) {
      config.auth = auth;
    }

    this.transporter = nodemailer.createTransport(config);

    this.logoUrl = `${process.env.API_URL}/assets/logo/clac_logo.svg`;
  }

  async sendEmailQontoActiveUsers(from, to, data, title, templatePath) {
    try {
      templatePath = './views/sendParseQontoActiveUsersInfos.ejs';

      const emailData = {
        ...data,
        name: 'Process parsing Qonto Active Users',
        description: 'Process de parsing des utilisateurs Qonto à inscrire',
        title: 'Parse Qonto Active Users',
      };

      const mail = await ejs.renderFile(templatePath, emailData);

      const mainOptions = {
        from,
        to,
        subject: title,
        html: mail,
        attachments: [
          {
            filename: 'parseQontoActiveUsers.json',
            content: JSON.stringify(data),
            contentType: 'application/json',
          },
        ],
      };
      await this.transporter.sendMail(mainOptions).then((payload) => {
        console.log(`succesfully sent email ${JSON.stringify(payload)}`);
      }).catch((error) => {
        console.log(`error to send email ${error}`);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendEmailQontoUsers(from, to, data, title, templatePath) {
    try {
      templatePath = './views/sendParseQontoUsersInfos.ejs';

      const emailData = {
        ...data,
        name: 'Process parsing Qonto Users',
        description: 'Process de parsing des utilisateurs Qonto à ajouter dans qonto_active_users',
        title: 'Parse Qonto Users',
      };

      const mail = await ejs.renderFile(templatePath, emailData);

      const mainOptions = {
        from,
        to,
        subject: title,
        html: mail,
        attachments: [
          {
            filename: 'parseQontoUsers.json',
            content: JSON.stringify(data),
            contentType: 'application/json',
          },
        ],
      };
      await this.transporter.sendMail(mainOptions).then((payload) => {
        console.log(`succesfully sent email ${JSON.stringify(payload)}`);
      }).catch((error) => {
        console.log(`error to send email ${error}`);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendResetPasswordEmail(to, data) {
    try {
      const templatePath = './views/forgotPassword.ejs';

      const emailData = {
        resetLink: `${process.env.APP_URL}/reset-password/${data}`,
        name: 'Forgot Password',
        logo_url: this.logoUrl,
        description: 'Email to send reset password link',
        title: 'Forgot Password',
      };

      const mail = await ejs.renderFile(templatePath, emailData);
      const from = process.env.MAIL_FROM;

      const mainOptions = {
        from,
        to,
        subject: 'Forgot Password Reset Link',
        html: mail,
      };

      await this.transporter.sendMail(mainOptions).then((payload) => {
        console.log(`succesfully sent email ${JSON.stringify(payload)}`);
      }).catch((error) => {
        console.log(`error to send email ${error}`);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendEmailErrorRequestClient(from, to, data, userData) {
    try {
      const templatePath = './views/sendEmailErrorRequestClient.ejs';

      const emailData = {
        title: data.title,
        error: data.error,
        message: data.message,
        userData: JSON.stringify(userData),
      };

      const mail = await ejs.renderFile(templatePath, emailData);

      const mainOptions = {
        from,
        to,
        subject: emailData.title,
        html: mail,
      };

      await this.transporter.sendMail(mainOptions).then((payload) => {
        console.info(`succesfully sent email ${JSON.stringify(payload)}`);
      }).catch((error) => {
        console.error(`error to send email ${error}`);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const emailSender = new EmailSender();

module.exports = emailSender;
