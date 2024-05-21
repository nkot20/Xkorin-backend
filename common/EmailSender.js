const ejs = require('ejs');
const nodemailer = require('nodemailer');
const SettingService = require('../services/SettingService');

const configMailer = {
  host: process.env.MAIL_HOST, // WEB UI LOCALHOST 8025
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

module.exports = class EmailSenderClass {
  static async EmailSender(emailData, templateLocation, to) {
    console.log('<<<<<<<to>>>>>>>', to);
    const emailSetting = await SettingService.list();

    function EmailValueGetter(value) {
      return emailSetting.filter((element) => element.key == value)[0].value;
    }

    return new Promise((resolve, reject) => {
      try {
        const { host, port, auth } = configMailer;

        const config = {
          host,
          port,
          secure: false,
          ignoreTLS: true,
        };

        if (auth.user && auth.pass) {
          config.auth = auth;
        }

        const transporter = nodemailer.createTransport(config);

        // console.log('email trasport data log display================',transporter);
        ejs.renderFile(templateLocation, emailData, (err, data) => {
          console.log('emailData-------', emailData);
          if (err) {
            console.log('emailData', err);
            console.log(err);
          } else {
            const mainOptions = {
              from: EmailValueGetter('setting_email_from_address'),
              to,
              subject: emailData.title,
              html: data,
            };
            console.log('mail mainoption display data here ================ ', mainOptions);
            transporter.sendMail(mainOptions, (err, info) => {
              if (err) {
                console.log('mail error display ================ ', err);
                reject(err);
              } else {
                console.log(`transaction mail Message sent: ${info.response}`);
                // console.log(
                //   "transaction mail Preview URL new : %s",
                //   nodemailer.getTestMessageUrl(info)
                // );
                resolve(info.response);
              }
            });
          }
        });
      } catch (error) {
        console.log('Email Send Error', error);
        reject(error);
      }
    });
  }
};
