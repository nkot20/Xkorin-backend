const Joi = require('joi');
const express = require('express');
const languageRepository = require('../../../repositories/LanguageRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const languageCreateSchema = Joi.object({
    label: Joi.string().required(),
    isoCode: Joi.string().required(),
});


router.post('/', validateSchema(languageCreateSchema), async (req, res) => {
    try {
        let payload = {
            label: req.body.label,
            isoCode: req.body.isoCode
        }
        const language = await languageRepository.create(payload);
        return res.status(200).json({message: "language saved sucessfuly", language})
    } catch (error) {
        logger.error('Error when adding a language', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const languages = await languageRepository.getAll();
        return res.status(200).send(languages);
    } catch (error) {
        logger.error('Error when getting languages', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

module.exports = router;
