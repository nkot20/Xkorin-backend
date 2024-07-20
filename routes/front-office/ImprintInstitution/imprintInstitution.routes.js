const Joi = require('joi');
const express = require('express');
const impRepository = require('../../../repositories/ImprintRepository');
const imprintInstitutionRepository = require('../../../repositories/ImprintInstitutionRepository');
const validateSchema = require("../../../middlewares/validationSchema");
const logger = require("../../../logger");
const router = express.Router();

const imprintInstitutionCreateSchema = Joi.object({
    imprintId: Joi.string().required(),
    institutionId: Joi.string().required(),
    status: Joi.string().required(),
    isAddedForAnInstitution: Joi.boolean()
});

//get variable group by imprint and get weight by institution
router.post('/create', validateSchema(imprintInstitutionCreateSchema), async (req, res) => {
    try {
        const imprintInstitution = await imprintInstitutionRepository.create(req.body);
        return res.status(200).send(imprintInstitution);
    } catch (error) {
        logger.error('Error when adding probes on imprint by institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/institution/:institutionId', async (req, res) => {
    try {
        const imprintInstitution = await imprintInstitutionRepository.getImprintsByInstitution(req.params.institutionId);
        return res.status(200).send(imprintInstitution);
    } catch (error) {
        logger.error('Error when getting probes on imprint by institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;