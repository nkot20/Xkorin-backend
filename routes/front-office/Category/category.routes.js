const Joi = require('joi');
const express = require('express');
const categoryService = require('../../../services/CategoryService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const asyncHandler = require('../../../middlewares/asyncHandler');


/**
 * @route GET /:isoCode
 * @desc Get all categories by language ISO code. Fetches categories and their translations based on the provided language code
 * @access Public
 * @param {string} isoCode - The ISO code for the language
 */
router.get(
    '/:isoCode',
    asyncHandler(async (req, res) => {
        const response = await categoryService.getAllCategoriesByLanguage(req.params.isoCode);
        res.status(200).send(response);
    })
);

module.exports = router;
