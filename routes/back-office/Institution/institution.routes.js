const Joi = require('joi');
const express = require('express');
const router = express.Router();
const institutionService = require('../../../services/InstitutionService');
const logger = require("../../../logger");
const asyncHandler = require('../../../middlewares/asyncHandler');

// Création d'une nouvelle institution
router.post(
    '/create',
    asyncHandler(async (req, res) => {
        const response = await institutionService.createInstitution(req.body);
        res.status(200).json({ message: 'Institution saved successfully', response });
    })
);

// Récupération de toutes les institutions
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await institutionService.getAllInstitutions();
        res.status(200).send(response);
    })
);

/**
 * get institution infos
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const response = await institutionService.getInstitutionById(req.params.id);
        res.status(200).send(response);
    })
);
module.exports = router;