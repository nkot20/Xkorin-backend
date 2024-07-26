const Joi = require('joi');
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');
const programRepository = require('../../../repositories/ProgramRepository');
const logger = require('../../../logger');
const validateSchema = require("../../../middlewares/validationSchema");

const programCreateSchema = Joi.object({
    name: Joi.string().required(),
    institutionId: Joi.string().required(),
    targetInstitutionId: Joi.string().required(),
});

const programUpdateSchema = Joi.object({
    _id: Joi.string(),
    name: Joi.string(),
    institutionId: Joi.string(),
    targetInstitutionId: Joi.string(),
});

/**
 * @route POST /create
 * @desc Create a new program
 * @access Public
 * @param {string} name - The name of the program
 * @param {string} institutionId - The ID of the institution
 * @param {string} targetInstitutionId - The ID of the target institution
 */
router.post(
    '/create',
    validateSchema(programCreateSchema),
    asyncHandler(async (req, res) => {
        const program = await programRepository.create(req.body);
        return res.status(200).send(program);
    })
);

/**
 * @route PATCH /update/:id
 * @desc Update an existing program
 * @access Public
 * @param {string} id - The ID of the program to update
 * @param {Object} body - The data to update the program with
 */
router.patch(
    '/update/:id',
    validateSchema(programUpdateSchema),
    asyncHandler(async (req, res) => {
        const program = await programRepository.update(req.params.id, req.body);
        return res.status(200).send(program);
    })
);

<<<<<<< Updated upstream
// get program by institutionId
router.get('/:institutionId', async (req, res) => {
    try {
=======
/**
 * @route GET /:institutionId/no-pagination/
 * @desc List programs by institution without pagination
 * @access Public
 * @param {string} institutionId - The ID of the institution
 */
router.get(
    '/:institutionId/no-pagination/',
    asyncHandler(async (req, res) => {
        const response = await programRepository.listProgramsByInstitutionWithoutPagination(req.params.institutionId);
        res.status(200).send(response);
    })
);

/**
 * @route GET /:institutionId
 * @desc List programs by institution with pagination
 * @access Public
 * @param {string} institutionId - The ID of the institution
 * @param {number} [page=1] - The page number for pagination
 * @param {number} [limit=10] - The number of items per page
 * @param {string} [search=''] - Search query
 * @param {string} [order='asc'] - Sorting order
 * @param {string} [sort='createdAt'] - Field to sort by
 */
router.get(
    '/:institutionId',
    asyncHandler(async (req, res) => {
>>>>>>> Stashed changes
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };
        const response = await programRepository.listProgramsByInstitution(req.params.institutionId, options);
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
        res.status(200).send({ programs: response.docs, pagination });
    })
);

/**
 * @route PATCH /archived/:id
 * @desc Archive a program
 * @access Public
 * @param {string} id - The ID of the program to archive
 */
router.patch(
    '/archived/:id',
    asyncHandler(async (req, res) => {
        const program = await programRepository.archivedProgram(req.params.id);
        return res.status(200).send(program);
    })
);

/**
 * @route GET /
 * @desc Get all programs
 * @access Public
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const programs = await programRepository.getAll();
        return res.status(200).send(programs);
    })
);

/**
 * @route GET /details/:id
 * @desc Get program details by ID
 * @access Public
 * @param {string} id - The ID of the program
 */
router.get(
    '/details/:id',
    asyncHandler(async (req, res) => {
        const program = await programRepository.getById(req.params.id);
        return res.status(200).send(program);
    })
);

module.exports = router;
