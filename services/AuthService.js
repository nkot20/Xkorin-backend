const companyRepository = require('../repositories/CompanyRepository');
const userRepository = require('../repositories/UserRepository');
const personRepository = require('../repositories/PersonRepository');
const User = require("../models/User");
const emailService = require("./emailService");
const jwt = require("jsonwebtoken");
const config = require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Helper = require('../common/Helper');

class AuthService {



    generateAccessToken = (user) => {
        const payload = { sub: user._id };
        return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '1h' });
    };

    /**
     * Vérifie si le token est encore valide en fonction de sa date d'expiration.
     * @param {string} validationToken - Token à vérifier.
     * @return {Promise<boolean>} - Une promesse qui résout en `true` si le token est valide, sinon `false`.
     */
    async isTokenValid(validationToken) {
        try {
            const user = await User.findOne({validationToken});

            if (!user) {
                throw new Error('User not found')
            }
            if (!user.validationToken || !user.validationExpirationToken) {
                throw new Error('Token or expiration date not found')
            }

            const now = new Date();

            // Vérifiez si le token correspond et s'il n'est pas expiré
            if (user.validationToken === validationToken && user.validationExpirationToken > now) {
                user.isValided = true;
                user.validationToken = '';
                user.validationExpirationToken = '';
                await User.updateOne(user);
                return user;
            } else {
                throw new Error('Token has expired')
            }
        } catch (err) {
            console.error('Erreur lors de la vérification du token:', err);
            throw err;
        }
    }
    async register(datas) {
        try {
            console.log("Starting registration process");

            // Vérification si l'utilisateur existe déjà
            console.log("Checking if user already exists");
            const oldUser = await userRepository.getUserByEmail(datas.email);
            if (oldUser) {
                console.warn("User already exists", oldUser);
                throw new Error("User already exists");
            }

            // Vérification si l'entreprise existe déjà
            console.log("Checking if company already exists");
            const oldCompany = await companyRepository.getCompanyByName(datas.company);
            if (oldCompany) {
                console.warn("Company already exists", oldCompany);
                throw new Error("Company already exists");
            }

            // Création des données utilisateur et création d'un nouvel utilisateur
            console.log("Creating new user");
            const userDatas = {
                name: datas.name,
                email: datas.email,
                password: datas.password,
                role: [3]
            };
            const user = new User(userDatas);

            // Enregistrement de l'utilisateur avec gestion des erreurs
            console.log("Saving new user");
            await user.save();

            // Génération du token et définition de la date d'expiration
            console.log("Generating token and setting expiration");
            const token = this.generateAccessToken(user);
            user.validationExpirationToken = new Date(Date.now() + 3600000); // +1 heure
            user.validationToken = token;
            user.validLink = `${process.env.CONFIRM_ACCOUNT_LINK}/${token}`;

            // Mise à jour de l'utilisateur avec le token de validation et la date d'expiration
            console.log("Updating user with token information");
            const newUser = await userRepository.updateUser(user._id, user);

            // Création des données entreprise et création d'une nouvelle entreprise
            console.log("Creating new company");
            const companyDatas = {
                name: datas.company,
                adminId: user._id,
                agreements: datas.agreements
            };
            const company = await companyRepository.createCompany(companyDatas);

            // Création des données personne et création d'une nouvelle personne
            console.log("Creating new person");
            const personDatas = {
                name: datas.name,
                email: datas.email,
                company_id: company._id,
                profil_id: datas.profil,
                subcategory_id: datas.subcategory,
                user_id: user._id,
            };
            const person = await personRepository.create(personDatas);

            // Conversion de l'image en Base64 et envoi de l'e-mail de validation
            console.log("Converting image to Base64 and sending validation email");
            const imagePath = path.join(__dirname, '../public/logos/xkorin.png');
            const base64String = await Helper.imageToBase64(imagePath);

            const emailDatas = {
                name: datas.name,
                email: datas.email,
                validLink: user.validLink,
                logoXkorin: base64String
            };
            await emailService.sendMailForValidateEmail(emailDatas);

            // Retourne la personne créée
            console.log("Registration process completed successfully");
            return person;
        } catch (error) {
            console.error("An error occurred during registration:", error);
            throw error;
        }
    }

}

const authRepository = new AuthService();
module.exports = authRepository;