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

}

const companyUserRepository = new CompanyUserRepository();

module.exports = companyUserRepository;