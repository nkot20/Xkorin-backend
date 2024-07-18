const Joi = require('joi');
const express = require('express');
const impRepository = require('../../../repositories/ImprintRepository');
const weightRepository = require('../../../repositories/WeightRepository');
const validateSchema = require("../../../middlewares/validationSchema");
const logger = require("../../../logger");
const router = express.Router();

const weightCreateSchema = Joi.object({
    optionId: Joi.string().required(),
    institutionId: Joi.string().required(),
    variableId: Joi.string().required(),
});

//get variable group by imprint and get weight by institution
router.post('/create', validateSchema(weightCreateSchema), async (req, res) => {
    try {

        const variables = await weightRepository.create(req.body);
        return res.status(200).send(variables)
    } catch (error) {
        logger.error('Error when adding new weight by institution', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;