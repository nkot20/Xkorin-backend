const Joi = require('joi');
const express = require('express');
const profilRepository = require('../../../repositories/ProfilRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const asyncHandler = require('../../../middlewares/asyncHandler');
const validateSchema = require("../../../middlewares/validationSchema");
const profilCreateSchema = Joi.object({
    translations: Joi.array().required()
});


// Create a new profil
router.post(
    '/',
    validateSchema(profilCreateSchema),
    asyncHandler(async (req, res) => {
        const profil = await profilRepository.create(req.body.translations);
        res.status(200).json({ message: 'Profil saved successfully', profil });
    })
);

// Get all profils
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const profils = await profilRepository.getAll();
        res.status(200).send(profils);
    })
);

module.exports = router;
