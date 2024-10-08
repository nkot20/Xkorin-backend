const Joi = require('joi');
const express = require('express');
const optionService = require('../../../services/OptionService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const asyncHandler = require('../../../middlewares/asyncHandler');
const validateSchema = require("../../../middlewares/validationSchema");

const optionCreateSchema = Joi.object({
    label: Joi.string().required(),
    isoCode: Joi.string().required(),
});

// Create a new option
router.post(
    '/',
    //validateSchema(optionCreateSchema),
    asyncHandler(async (req, res) => {
        const response = await optionService.createOption(req.body.option, req.body.translation);
        res.status(201).send(response);
    })
);

// Get options by ISO code
router.get(
    '/:isoCode',
    asyncHandler(async (req, res) => {
        const response = await optionService.getAllOptionsByLanguage(req.params.isoCode);
        res.status(201).send(response);
    })
);

module.exports = router;