const Joi = require('joi');
const express = require('express');
const optionRepository = require('../../../repositories/OptionRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");


router.post('/', async (req, res) => {
    try {
        const response = await optionRepository.create(req.body.option, req.body.translation);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when creating option and its translations", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:isoCode', async (req, res) => {
    try {
        const response = await optionRepository.getAllByIsoCodeLanguage(req.params.isoCode);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting option and it translation", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;