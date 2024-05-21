const Joi = require('joi');
const express = require('express');
const imprintRepository = require('../../../repositories/ImprintRepository');
const variableRepository = require('../../../repositories/VariableRepository');
const validateSchema = require('../../../middlewares/validationSchema');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const footprintCreateSchema = Joi.object({
    name: Joi.string().required(),
    color: Joi.string().required(),
});


//create imprint
router.post('/', validateSchema(footprintCreateSchema), async (req, res)  => {
    try {
        const footprint = await imprintRepository.createFootprint(req.body);
        return res.status(200).json({message: "imprint saved sucessfuly", footprint})
    } catch (error) {
        logger.error('Error when creating imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const response = await imprintRepository.getAll();
        return res.status(200).send(response)
    } catch (error) {
        logger.error('Error when getting imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

router.get('/tree', async (req, res) => {
    try {
        const response = await imprintRepository.getFootprintVariableTree();
        return res.status(200).send(response)
    } catch (error) {
        logger.error('Error when getting imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;