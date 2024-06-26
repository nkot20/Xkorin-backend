const Joi = require('joi');
const express = require('express');
const subCategoryRepository = require('../../../repositories/SubCategoryRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const subCategoryImprintRepository = require("../../../repositories/SubCategoryImprintRepository");


router.post('/', async (req, res) => {
    try {
        const response = await subCategoryRepository.create(req.body.subcategory, req.body.translation);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when creating the subcategory and her translation:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//get all
router.get('/', async (req, res) => {
    try {
        const response = await subCategoryRepository.getAll();
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting categories and her translations", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//get all by language isoCode
router.get('/:categoryId/:isoCode', async (req, res) => {
    try {
        const response = await subCategoryRepository.getAllByLangageAndCategory(req.params.isoCode, req.params.categoryId);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting categories by language isoCode and her translations", error);
        res.status(500).json({ message: error.message });
    }
});

// add imprint to subcategory
router.post('/imprint/:subcategoryId/', async (req, res) => {
    try {
       const response = await subCategoryImprintRepository.create(req.body.imprintId, req.params.subcategoryId);
        res.status(201).send(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})



module.exports = router;