const Joi = require('joi');
const express = require('express');
const companyRepository = require('../../../repositories/CompanyRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require('../../../middlewares/validationSchema');
const asyncHandler = require('../../../middlewares/asyncHandler');

/**
 * @route GET /:institutionId/all
 * @desc Get all companies and their admins by institution ID
 * @access Public
 * @param {string} institutionId - The ID of the institution
 * @query {number} [page=1] - The page number for pagination
 * @query {number} [limit=10] - The number of items per page
 * @query {string} [search=''] - Search query
 * @query {string} [order='asc'] - Sorting order
 * @query {string} [sort='createdAt'] - Field to sort by
 */
router.get(
    '/:institutionId/all',
    asyncHandler(async (req, res) => {
        const options = {
            institutionId: req.params.institutionId,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };

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
        res.status(200).send({ companies: response.docs, pagination });
    })
);

module.exports = router;
