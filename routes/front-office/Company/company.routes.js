const Joi = require('joi');
const express = require('express');
const companyRepository = require('../../../repositories/CompanyRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

//get all by language isoCode
router.get('/:institutionId/all', async (req, res) => {
    try {
        const options = {
            institutionId: req.params.institutionId,
            page: parseInt(req.query.page) || 1,
            limit: req.query.limit || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };
        /*  const instutionId = req.params.institutionId;
            const { page = 1, limit = 10, sort = 'name', order = 'asc', search = '' } = req.query;
        */
        const response = await companyRepository.getCompaniesAndAdminsByInstitutionId2(options);
        const pagination = {
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage,
            limit: response.limit,
            nextPage: response.nextPage,
            page: response.page - 1,
            pagingCounter: response.pagingCounter,
            prevPage: response.prevPage,
            totalDocs: response.totalDocs,
            totalPages: response.totalPages,
        };
        res.status(201).send({companies: response.docs, pagination});
    } catch (error) {
        logger.error("Error when getting categories by language isoCode and her translations", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;