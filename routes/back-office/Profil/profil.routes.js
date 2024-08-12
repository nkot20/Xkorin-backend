const Joi = require('joi');
const express = require('express');
const profilService = require('../../../services/ProfilService');
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
        const profil = await profilService.createProfilWithTranslations(req.body.translations);
        res.status(200).json({ message: 'Profil saved successfully', profil });
    })
);

// Get all profils
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const profils = await profilService.getAllProfilsWithTranslations();
        res.status(200).send(profils);
    })
);

module.exports = router;
