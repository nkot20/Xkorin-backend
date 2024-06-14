const companyRepository = require('../repositories/companyRepository');
const userRepository = require('../repositories/UserRepository');
const personRepository = require('../repositories/PersonRepository');
const User = require("../models/User");
const emailService = require("./emailService");
const jwt = require("jsonwebtoken");
const config = require('dotenv').config();

class AuthService {

    generateAccessToken = (user) => {
        const payload = { sub: user._id };
        return jwt.sign(payload, config.parsed.JWT_SECRET, { expiresIn: '1h' });
    };

    async register(datas) {
        try {
            //save user and token
            const userDatas = {
                first_name: datas.name,
                email: datas.email,
                password: datas.password,
                role: [3]
            };
            const user = new User(userDatas)
            user.save((err) => {
                if (err)
                    throw err;
            });
            const token = this.generateAccessToken(user)
            user.validationExpirationToken = Date.now() + 3600000;
            user.validLink =  `${process.env.CONFIRM_ACCOUNT_LINK}/${token}`;
            const newUser = await userRepository.updateUser(user._id, user);

            //save company
            const companyDatas = {
                name: datas.company,
                adminId: user._id,
                agreements: datas.agreements
            }
            const company = await companyRepository.createCompany(companyDatas);
            const personDatas = {
                name: datas.name,
                email: datas.email,
                company_id: company._id,
                profil_id: datas.profil,
                subcategory_id: datas.subcategory,
                user_id: user._id,
            }

            //save person
            const person = await personRepository.create(personDatas);

            //send email
            const emailDatas = {
                name: datas.name,
                email: datas.email,
                validLink: user.validLink,
                logoXkorin: `${process.env.HOST}/logos/xkorin.png`
            }
            await emailService.sendMailForValidateEmail(emailDatas);
            return person;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const authRepository = new AuthService();
module.exports = authRepository;