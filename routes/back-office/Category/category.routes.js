const Joi = require('joi');
const express = require('express');
const categoryService = require('../../../services/CategoryService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const asyncHandler = require('../../../middlewares/asyncHandler');

/**
 * Create category with translation in other languages
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { category, translations } = req.body;
        const response = await categoryService.createCategoryWithTranslations(category, translations);
        res.status(201).json(response);
    })
);

/**
 * get all category with their translation
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await categoryService.getAllCategoriesWithTranslations();
        return res.status(200).json(response);
    })
);

/**
 * get all category without translation and pagination
 */
router.get(
    '/all/no-pagination',
    asyncHandler(async (req, res) => {
        const response = await categoryService.getAllCategory();
        return res.status(200).json(response);
    })
);

/**
 * get all category without translation and pagination
 */
router.get(
    '/details/:id',
    asyncHandler(async (req, res) => {
        const response = await categoryService.getCategoryWithTranslation(req.params.id);
        return res.status(200).json(response);
    })
);

/**
 * get all category with a specific language
 */
router.get(
    '/:isoCode',
    asyncHandler(async (req, res) => {
        const { isoCode } = req.params;
        const response = await categoryService.getAllCategoriesByLanguage(isoCode);
        res.status(200).json(response);
    })
);

module.exports = router;

module.exports = router;