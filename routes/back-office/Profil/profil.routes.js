const Joi = require('joi');
const express = require('express');
const profilRepository = require('../../../repositories/ProfilRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const profilCreateSchema = Joi.object({
    translations: Joi.array().required()
});


router.post('/', validateSchema(profilCreateSchema), async (req, res) => {
    try {

        const profil = await profilRepository.create(req.body.translations);
        return res.status(200).json({message: "profil saved sucessfuly", profil})
    } catch (error) {
        logger.error('Error when adding a profil', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const profils = await profilRepository.getAll();
        return res.status(200).send(profils);
    } catch (error) {
        logger.error('Error when getting profil', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

module.exports = router;
