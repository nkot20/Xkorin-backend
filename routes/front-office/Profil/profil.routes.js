const Joi = require('joi');
const express = require('express');
const profilRepository = require('../../../repositories/ProfilRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");


// get by isoCode language
router.get('/:isoCode', async (req, res) => {
    try {
        const profils = await profilRepository.getAllByLanguage(req.params.isoCode);
        return res.status(200).send(profils);
    } catch (error) {
        logger.error('Error when getting profil', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

module.exports = router;
