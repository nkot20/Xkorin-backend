const Joi = require('joi');
const express = require('express');
const router = express.Router();
const institutionRepository = require('../../../repositories/InstitutionRepository');
const logger = require("../../../logger");

router.post('/create', async (req, res) => {
    try {
        const response = await institutionRepository.create(req.body);
        return res.status(200).json({message: "institution saved sucessfuly", response})
    } catch (error) {
        logger.error('Error when adding institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const response = await institutionRepository.getAll()
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;