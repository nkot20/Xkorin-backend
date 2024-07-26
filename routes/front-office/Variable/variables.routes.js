const Joi = require('joi');
const express = require('express');
const impRepository = require('../../../repositories/ImprintRepository');
const variableRepository = require('../../../repositories/VariableRepository');
const validateSchema = require("../../../middlewares/validationSchema");
const logger = require("../../../logger");
const router = express.Router();

//get variable group by imprint and get weight by institution
router.get('/weight/:institutionId/:isoCode', async (req, res) => {
    try {

        const variables = await variableRepository.getLeafVariablesGroupedByImprints(req.params.institutionId, req.params.isoCode);
        return res.status(200).send(variables)
    } catch (error) {
        logger.error('Error when getting variable group by imprint and weight', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;