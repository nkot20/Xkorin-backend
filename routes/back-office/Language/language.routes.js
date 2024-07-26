const Joi = require('joi');
const express = require('express');
const languageRepository = require('../../../repositories/LanguageRepository');
const router = express.Router();
const logger = require('../../../logger');
const asyncHandler = require('../../../middlewares/asyncHandler');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");


const languageCreateSchema = Joi.object({
    label: Joi.string().required(),
    isoCode: Joi.string().required(),
});


// Create a new language
router.post(
    '/',
    validateSchema(languageCreateSchema),
    asyncHandler(async (req, res) => {
        const payload = {
            label: req.body.label,
            isoCode: req.body.isoCode,
        };
        const language = await languageRepository.create(payload);
        res.status(200).json({ message: 'Language saved successfully', language });
    })
);

// Get all languages
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const languages = await languageRepository.getAll();
        res.status(200).send(languages);
    })
);
module.exports = router;
