const Joi = require('joi');
const express = require('express');
const router = express.Router();
const imprintRepository = require('../../../repositories/ImprintRepository');
const logger = require("../../../logger");

router.get("/variable-questions/:profilId/:subcategoryId/:isoCode", async (req, res) => {
    try {
        const response = await imprintRepository.getVariablesForImprints(req.params.subcategoryId, req.params.isoCode, req.params.profilId)
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting profil', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;