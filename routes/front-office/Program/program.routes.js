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

// get program by institutionId
router.get('/:institutionId', async (req, res) => {
    try {
        const program = await programRepository.listAllInstitutionProgram(req.params.institutionId);
        return res.status(200).send(program);
    } catch (error) {
        logger.error('Error when getting institution programs', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

// archive program
router.patch('/:id', async (req, res) => {
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

module.exports = router;
