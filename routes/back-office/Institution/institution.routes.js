const Joi = require('joi');
const express = require('express');
const router = express.Router();
const institutionRepository = require('../../../repositories/InstitutionRepository');
const logger = require("../../../logger");
const asyncHandler = require('../../../middlewares/asyncHandler');

// Création d'une nouvelle institution
router.post(
    '/create',
    asyncHandler(async (req, res) => {
        const response = await institutionRepository.create(req.body);
        res.status(200).json({ message: 'Institution saved successfully', response });
    })
);

// Récupération de toutes les institutions
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await institutionRepository.getAll();
        res.status(200).send(response);
    })
);

module.exports = router;