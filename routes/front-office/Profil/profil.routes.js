const Joi = require('joi');
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');
const profilService = require('../../../services/ProfilService');
const logger = require('../../../logger');

/**
 * @route GET /:isoCode
 * @desc Get profiles by ISO code language
 * @access Public
 * @param {string} isoCode - The ISO code for the language
 */
router.get(
    '/:isoCode',
    asyncHandler(async (req, res) => {
        const profils = await profilService.getAllProfilsByLanguage(req.params.isoCode);
        return res.status(200).send(profils);
    })
);

module.exports = router;
