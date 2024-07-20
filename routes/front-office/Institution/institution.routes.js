const Joi = require('joi');
const express = require('express');
const router = express.Router();
const institutionRepository = require('../../../repositories/InstitutionRepository');
const logger = require("../../../logger");

router.get('/', async (req, res) => {
    try {
        const response = await institutionRepository.getAll()
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

/**
 * get institution by type
 */
router.get('/type/:type', async (req, res) => {
    try {
        const response = await institutionRepository.getByType(req.params.type)
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting institution by type', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

/**
 * update institution after first login
 */
router.patch('/update-first-login/:institutionId/user/:userId',async (req, res) => {
    try {
        const response = await institutionRepository.updateAfterFirstInscription(req.params.userId, req.params.institutionId, req.body);
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when updating institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});
module.exports = router;