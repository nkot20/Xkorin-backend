const Joi = require('joi');
const express = require('express');
const userRepository = require('../../../repositories/UserRepository');
const personRepository = require('../../../repositories/PersonRepository');
const companyRepository = require('../../../repositories/CompanyRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");


// get by isoCode language
router.patch('/update/:userId', async (req, res) => {
    try {
        const user = req.body.user;
        const person = req.body.person;
        const company = req.body.company;
        const userResponse = await userRepository.updateUser(req.params.userId, user);
        const personResponse = await personRepository.updatePerson(person._id, person);
        const companyResponse = await companyRepository.updateCompany(company._id, company);
        return res.status(200).send(userResponse);
    } catch (error) {
        logger.error('Error when setting infos', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

module.exports = router;
