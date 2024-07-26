const Joi = require('joi');
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');
const institutionRepository = require('../../../repositories/InstitutionRepository');
const logger = require("../../../logger");

/**
 * @route GET /
 * @desc Get all institutions
 * @access Public
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await institutionRepository.getAll();
        return res.status(200).send(response);
    })
);

/**
<<<<<<< Updated upstream
 * update institution after first login
=======
 * @route GET /type/:type
 * @desc Get institutions by type
 * @access Public
 * @param {string} type - The type of institutions to retrieve
 */
router.get(
    '/type/:type',
    asyncHandler(async (req, res) => {
        const response = await institutionRepository.getByType(req.params.type);
        return res.status(200).send(response);
    })
);

/**
 * @route PATCH /update-first-login/:institutionId/user/:userId
 * @desc Update institution after first login
 * @access Public
 * @param {string} institutionId - The ID of the institution
 * @param {string} userId - The ID of the user
 * @param {Object} body - The data to update
>>>>>>> Stashed changes
 */
router.patch(
    '/update-first-login/:institutionId/user/:userId',
    asyncHandler(async (req, res) => {
        const response = await institutionRepository.updateAfterFirstInscription(req.params.userId, req.params.institutionId, req.body);
        return res.status(200).send(response);
    })
);

module.exports = router;
