const Joi = require('joi');
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');
const programService = require('../../../services/ProgramService');
const logger = require('../../../logger');
const validateSchema = require("../../../middlewares/validationSchema");


const programCreateSchema = Joi.object({
    name: Joi.string().required(),
    institutionId: Joi.string().required(),
    targetInstitutionId: Joi.string().required(),
    numberOfParticipants: Joi.number(),
    amount: Joi.number(),
    imprintIds: Joi.array()
});

const programUpdateSchema = Joi.object({
    _id: Joi.string(),
    name: Joi.string(),
    institutionId: Joi.string(),
    targetInstitutionId: Joi.string(),
    numberOfParticipants: Joi.number(),
    amount: Joi.number()
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
        const program = await programService.create(req.body);
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
        const program = await programService.update(req.params.id, req.body);
        return res.status(200).send(program);
    })
);


/**
 * @route GET /:institutionId/no-pagination/
 * @desc List programs by institution without pagination
 * @access Public
 * @param {string} institutionId - The ID of the institution
 */
router.get(
    '/:institutionId/no-pagination/',
    asyncHandler(async (req, res) => {
        const response = await programService.listProgramsByInstitutionWithoutPagination(req.params.institutionId);
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
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };
        const response = await programService.listProgramsByInstitution(req.params.institutionId, options);
        const pagination = {
            hasNextPage: response.pagination.hasNextPage,
            hasPrevPage: response.pagination.hasPrevPage,
            limit: response.pagination.limit,
            nextPage: response.pagination.nextPage,
            page: response.pagination.page - 1,
            pagingCounter: response.pagination.pagingCounter,
            prevPage: response.pagination.prevPage,
            totalDocs: response.pagination.totalDocs,
            totalPages: response.pagination.totalPages,
        };
        res.status(200).send({ programs: response.programs, pagination });
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
        const program = await programService.archivedProgram(req.params.id);
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
        const programs = await programService.getAll();
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
        const program = await programService.getById(req.params.id);
        return res.status(200).send(program);
    })
);



/**
 * @route GET /participants/:id
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
    '/participants/list/:id',
    asyncHandler(async (req, res) => {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };
        const response = await programService.getDetails(req.params.id, options);
        const pagination = {
            hasNextPage: response.pagination.hasNextPage,
            hasPrevPage: response.pagination.hasPrevPage,
            limit: response.pagination.limit,
            nextPage: response.pagination.nextPage,
            page: response.pagination.page - 1,
            pagingCounter: response.pagination.pagingCounter,
            prevPage: response.pagination.prevPage,
            totalDocs: response.pagination.totalDocs,
            totalPages: response.pagination.totalPages,
        };
        res.status(200).send({ participants: response.participantsWithCompany, pagination });
    })
);

module.exports = router;
