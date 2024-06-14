const Joi = require('joi');
const express = require('express');
const categoryRepository = require('../../../repositories/CategoryRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

//get all by language isoCode
router.get('/:isoCode', async (req, res) => {
    try {
        const response = await categoryRepository.getAllByLangage(req.params.isoCode);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting categories by language isoCode and her translations", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;