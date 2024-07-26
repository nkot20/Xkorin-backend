const Joi = require('joi');
const express = require('express');
const asyncHandler = require('../../../middlewares/asyncHandler'); // Assuming asyncHandler is defined here
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

/**
 * @route POST /create
 * @desc Create a new imprint-institution association
 * @access Public
 * @param {string} imprintId - The ID of the imprint
 * @param {string} institutionId - The ID of the institution
 * @param {string} status - The status of the association
 * @param {boolean} isAddedForAnInstitution - Indicates if it was added for an institution
 */
router.post(
    '/create',
    validateSchema(imprintInstitutionCreateSchema),
    asyncHandler(async (req, res) => {
        const imprintInstitution = await imprintInstitutionRepository.create(req.body);
        return res.status(200).send(imprintInstitution);
    })
);

/**
 * @route GET /institution/:institutionId
 * @desc Get imprints associated with an institution
 * @access Public
 * @param {string} institutionId - The ID of the institution
 */
router.get(
    '/institution/:institutionId',
    asyncHandler(async (req, res) => {
        const imprintInstitution = await imprintInstitutionRepository.getImprintsByInstitution(req.params.institutionId);
        return res.status(200).send(imprintInstitution);
    })
);

module.exports = router;
