const Joi = require('joi');
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');
const optionRepository = require('../../../repositories/OptionRepository');
const logger = require('../../../logger');

/**
 * @route GET /:isoCode
 * @desc Get options by ISO code language
 * @access Public
 * @param {string} isoCode - The ISO code for the language
 */
router.get(
    '/:isoCode',
    asyncHandler(async (req, res) => {
        const response = await optionRepository.getAllByIsoCodeLanguage(req.params.isoCode);
        res.status(200).send(response);
    })
);

module.exports = router;
