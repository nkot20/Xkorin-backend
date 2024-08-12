const Joi = require('joi');
const express = require('express');
const categoryService = require('../../../services/CategoryService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const asyncHandler = require('../../../middlewares/asyncHandler');

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { category, translation } = req.body;
        const response = await categoryService.createCategoryWithTranslations(category, translation);
        res.status(201).json(response);
    })
);

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await categoryService.getAllCategoriesWithTranslations();
        return res.status(200).json(response);
    })
);

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