const companyRepository = require('../repositories/CompanyRepository');
const userRepository = require('../repositories/UserRepository');
const institutionService = require('../services/InstitutionService');
const personRepository = require('../repositories/PersonRepository');
const User = require("../models/User");
const emailService = require("./emailService");
const jwt = require("jsonwebtoken");
const config = require('dotenv').config();
const Role = require('../config/role');
const fs = require('fs');
const path = require('path');
const Helper = require('../common/Helper');

generateAccessToken = (user) => {
    const payload = { sub: user._id };
    return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '1h' });
};

class AuthService {





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
                await User.updateOne({_id: user._id},user);
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

            // Vérification si l'entité existe déjà (entreprise ou institution)
            if (datas.type === 'company') {
                const oldCompany = await companyRepository.getCompanyByName(datas.company);
                if (oldCompany) {
                    console.warn("Company already exists", oldCompany);
                    throw new Error("Company already exists");
                }
            } else if (datas.type === 'institution') {
                const oldInstitution = await institutionService.getByName(datas.company);
                if (oldInstitution) {
                    console.warn("Institution already exists", oldInstitution);
                    throw new Error("Institution already exists");
                }
            } else {
                throw new Error("Invalid registration type");
            }

            // Utilisation de la stratégie de registration appropriée
            const registrationStrategy = RegistrationFactory.getRegistrationStrategy(datas.type);
            const result = await registrationStrategy.register(datas);

            console.log("Registration process completed successfully");
            return result;

        } catch (error) {
            console.error("An error occurred during registration:", error);
            throw new Error(error.message);
        }
    }


}

class RegistrationFactory {
    static getRegistrationStrategy(type) {
        switch (type) {
            case 'company':
                return new CompanyRegistrationStrategy();
            case 'institution':
                return new InstitutionRegistrationStrategy();
            default:
                throw new Error('Invalid registration type');
        }
    }
}

class RegistrationStrategy {
    async register(datas) {
        throw new Error('This method should be overridden');
    }
}

class CompanyRegistrationStrategy extends RegistrationStrategy {
    async register(datas) {
        // Logique de vérification et création de l'utilisateur
        const userDatas = {
            name: datas.name,
            email: datas.email,
            password: datas.password,
            role: [Role.COMPANY_ADMIN],
        };
        const user = new User(userDatas);
        await user.save();

        // Génération du token et mise à jour de l'utilisateur
        const token = generateAccessToken(user);
        user.validationExpirationToken = new Date(Date.now() + 3600000);
        user.validationToken = token;
        user.validLink = `${process.env.CONFIRM_ACCOUNT_LINK}/${token}`;
        await userRepository.updateUser(user._id, user);

        // Création de l'entreprise
        const companyDatas = {
            name: datas.company,
            adminId: user._id,
            agreements: datas.agreements,
        };
        const company = await companyRepository.createCompany(companyDatas);

        // Création de la personne
        const personDatas = {
            name: datas.name,
            email: datas.email,
            company_id: company._id,
            profil_id: datas.profil,
            subcategory_id: datas.subcategory,
            user_id: user._id,
        };
        const person = await personRepository.create(personDatas);

        // Envoi de l'email de validation
        const imagePath = path.join(__dirname, '../public/logos/xkorin.PNG');
        const base64String = await Helper.imageToBase64(imagePath);
        const emailDatas = {
            name: datas.name,
            email: datas.email,
            validLink: user.validLink,
            logoXkorin: base64String,
        };
        await emailService.sendMailForValidateEmail(emailDatas);

        return person;
    }
}

class InstitutionRegistrationStrategy extends RegistrationStrategy {
    async register(datas) {
        // Logique de vérification et création de l'utilisateur
        const userDatas = {
            name: datas.name,
            email: datas.email,
            password: datas.password,
            role: [Role.INSTITUTION_ADMIN],
        };
        const user = new User(userDatas);
        await user.save();

        // Génération du token et mise à jour de l'utilisateur
        const token = generateAccessToken(user);
        user.validationExpirationToken = new Date(Date.now() + 3600000);
        user.validationToken = token;
        user.validLink = `${process.env.CONFIRM_ACCOUNT_LINK}/${token}`;
        await userRepository.updateUser(user._id, user);

        // Création de l'institution
        const institutionDatas = {
            name: datas.company,
            adminId: user._id,
            status: "Active",
            agreements: datas.agreements,
            subcategory_id: datas.subcategory,
        };
        const institution = await institutionService.create(institutionDatas);

        // Envoi de l'email de validation
        const imagePath = path.join(__dirname, '../public/logos/xkorin.PNG');
        const base64String = await Helper.imageToBase64(imagePath);
        const emailDatas = {
            name: datas.name,
            email: datas.email,
            validLink: user.validLink,
            logoXkorin: base64String,
        };
        await emailService.sendMailForValidateEmail(emailDatas);

        return institution;
    }
}


const authRepository = new AuthService();
module.exports = authRepository;