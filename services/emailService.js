const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const fs = require('fs');
// Charge le modèle Handlebars depuis un fichier
const sourceConnexion = fs.readFileSync('templates/connexion_respo-template.hbs', 'utf8');
const templateConnexion = Handlebars.compile(sourceConnexion);

const sourceReset = fs.readFileSync('templates/reset_password-template.hbs', 'utf8');
const templateReset = Handlebars.compile(sourceReset);

const sourceValidate = fs.readFileSync('templates/valid_email-template.hbs', 'utf8');
const templateValidate = Handlebars.compile(sourceValidate);

const sourceNotification = fs.readFileSync('templates/notification-template.hbs', 'utf8');
const templateNotification = Handlebars.compile(sourceNotification);


class EmailService {

    //Configuration de nodemailer pour l'envoi d'e-mails
    transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_SOURCE,
            pass: process.env.MAIL_KEY
        }
    });
/*
     transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
    });*/

    sendMailForConnection = (data) => {

        const emailContent = templateConnexion(data);
        // Définition des options de l'e-mail
        const mailOptions = {
            from: process.env.MAIL_SOURCE,
            to: data.email,
            subject: 'Création compte Xkorin / Creating account Xkorin',
            html: emailContent
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
            } else {
                console.log('E-mail envoyé :', info.response);
            }
        });
    }

    sendMailForResetPassword = (data) => {
        const emailContent = templateReset(data);
        // Définition des options de l'e-mail
        const mailOptions = {
            from: process.env.MAIL_SOURCE,
            to: data.email,
            subject: 'Réinitialisation mot de passe',
            html: emailContent
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
                throw error;
            } else {
                console.log('E-mail envoyé :', info.response);

            }
        });
    }

    sendMailForValidateEmail = (data) => {
        const emailContent = templateValidate(data);
        // Définition des options de l'e-mail
        const mailOptions = {
            from: process.env.MAIL_SOURCE,
            to: data.email,
            subject: 'Confirm your e-mail address, Xkorin',
            html: emailContent
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
            } else {
                console.log('E-mail envoyé :', info.response);
            }
        });
    }

}

module.exports = new EmailService();
