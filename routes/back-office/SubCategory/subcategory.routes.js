const Joi = require('joi');
const express = require('express');
const subCategoryRepository = require('../../../repositories/SubCategoryRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const subCategoryImprintRepository = require("../../../repositories/SubCategoryImprintRepository");
const asyncHandler = require('../../../middlewares/asyncHandler');

/**
 * @route POST /subcategories
 * @desc Create a new subcategory and its translation
 * @access Public
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const response = await subCategoryRepository.create(req.body.subcategory, req.body.translation);
        res.status(201).json(response);
    })
);

/**
 * @route GET /subcategories
 * @desc Retrieve all subcategories and their translations
 * @access Public
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await subCategoryRepository.getAll();
        res.status(200).json(response);
    })
);

/**
 * @route GET /subcategories/:categoryId/:isoCode
 * @desc Retrieve all subcategories by language ISO code and category ID
 * @access Public
 */
router.get(
    '/:categoryId/:isoCode',
    asyncHandler(async (req, res) => {
        const response = await subCategoryRepository.getAllByLangageAndCategory(req.params.isoCode, req.params.categoryId);
        res.status(200).json(response);
    })
);

/**
 * @route POST /subcategories/imprint/:subcategoryId
 * @desc Add an imprint to a subcategory
 * @access Public
 */
router.post(
    '/imprint/:subcategoryId',
    asyncHandler(async (req, res) => {
        const response = await subCategoryImprintRepository.create(req.body.imprintId, req.params.subcategoryId);
        res.status(201).json(response);
    })
);



module.exports = router;