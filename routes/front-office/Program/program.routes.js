const Joi = require('joi');
const express = require('express');
const programRepository = require('../../../repositories/ProgramRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
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


router.post('/create', validateSchema(programCreateSchema), async (req, res) => {
    try {
        const program = await programRepository.create(req.body);
        return res.status(200).send(program);
    } catch (error) {
        logger.error('Error when created program', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.patch('/update/:id', validateSchema(programUpdateSchema), async (req, res) => {
    try {
        const program = await programRepository.update(req.params.id, req.body);
        return res.status(200).send(program);
    } catch (error) {
        logger.error('Error when created program', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/:institutionId/no-pagination/', async (req, res) => {
    try {
        const response = await programRepository.listProgramsByInstitutionWithoutPagination(req.params.institutionId);
        res.status(201).send(response);
    } catch (error) {
        logger.error('Error when getting institution programs', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

// get program by institutionId
router.get('/:institutionId', async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: req.query.limit || 10,
            search: req.query.search || '',
            sortDirection: req.query.order === 'asc' ? -1 : 1,
            sortBy: req.query.sort || 'createdAt',
        };
        const response = await programRepository.listProgramsByInstitution(req.params.institutionId,options);
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
        res.status(201).send({programs: response.docs, pagination});
    } catch (error) {
        logger.error('Error when getting institution programs', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

// archive program
router.patch('/archived/:id', async (req, res) => {
    try {
        const program = await programRepository.archivedProgram(req.params.id);
        return res.status(200).send(program);
    } catch (error) {
        logger.error('Error when archived program', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

//get all
router.get('/', async (req, res) => {
    try {
        const programs = await programRepository.getAll();
        return res.status(200).send(programs);
    } catch (error) {
        logger.error('Error when getting all program', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

//get program details
router.get('/details/:id', async (req, res) => {
    try {
        const program = await programRepository.getById(req.params.id);
        return res.status(200).send(program);
    } catch (error) {
        logger.error('Error when getting program details', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});


module.exports = router;
