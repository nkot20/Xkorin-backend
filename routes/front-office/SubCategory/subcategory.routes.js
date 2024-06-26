const Joi = require('joi');
const express = require('express');
const subCategoryRepository = require('../../../repositories/SubCategoryRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

//get all by language isoCode
router.get('/:idCategory/:isoCode', async (req, res) => {
    try {
        console.log(req.params)
        const response = await subCategoryRepository.getAllByLangageAndCategory(req.params.isoCode, req.params.idCategory);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting categories by language isoCode and her translations", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;