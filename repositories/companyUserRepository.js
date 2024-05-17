require('dotenv').config();

const Company = require('../models/Company');
const User = require('../models/User');
const Client = require('../ClientMongo/MongoClientTransaction');
const emailService = require("../services/emailService");
const crypto = require("crypto");

class CompanyUserRepository {
    
    /**
     * create Company and user that will be admin to this Company
     * @param company
     * @param user
     * @returns {Promise<void>}
     */
    async createCompany (company, user) {
        const client = Client.getClient();
        const session = client.startSession();

        try {
            session.startTransaction();

            // save user
            const userClient = client.db("ICC").collection("users");
            const token = crypto.randomBytes(20).toString('hex');
            user.validationToken = token;
            user.validationExpirationToken = Date.now() + 3600000;
            user.validLink =  `${process.env.CONFIRM_ACCOUNT_LINK}/${token}`;
            const result_save_user = await userClient.insertOne(user);

            // save Company
            const companyClient = client.db("ICC").collection("companies");
            company.adminId = result_save_user.insertedId;
            await companyClient.insertOne(company);

            //send email
            await emailService.sendMailForValidateEmail(user);

            await session.commitTransaction();
        } catch (error) {
            console.log("An error occurred during the transaction:" + error);
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
    
}

const companyUserRepository = new CompanyUserRepository();

module.exports = companyUserRepository;