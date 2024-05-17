const Joi = require('joi');
const express = require('express');
const impRepository = require('../../../repositories/ImprintRepository');
const variableRepository = require('../../../repositories/VariableRepository');
const validateSchema = require("../../../middlewares/validationSchema");
const logger = require("../../../logger");
const router = express.Router();

const variableCreateSchema = Joi.object({
    names: Joi.array().required(),
    imprintId: Joi.string().required(),
    isFactor: Joi.boolean().required(),
    definitions: Joi.array(),
    problems: Joi.array(),
    isAddedByCompany: Joi.boolean()
});

const variableUpdateSchema = Joi.object({
    names: Joi.array().required(),
    imprintId: Joi.string().required(),
    isFactor: Joi.boolean().required(),
    definitions: Joi.array(),
    problems: Joi.array(),
    isAddedByCompany: Joi.boolean()
});

const variableImprintCreateSchema = Joi.object({
    names: Joi.array().required(),
    imprintId: Joi.string().required(),
    problems: Joi.array(),
    isAddedByCompany: Joi.boolean()
});


/**
 * add variable to a imprint
 */
router.post('/create', validateSchema(variableImprintCreateSchema), async (req, res) => {
    try {
        let datas = {
            name: req.body.name,
            imprintId: req.body.imprintId,
        }
        const variable = await variableRepository.create(datas, req.body.names, req.body.problems);
        return res.status(200).json({message: "variable saved sucessfuly", variable})
    } catch (error) {
        logger.error('Error when adding variable to imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

/**
 * add child to a variable
 * @param id is id parent variable
 */
router.patch('/add/child/:id', validateSchema(variableCreateSchema), async (req, res) => {
    try {
        let datas = {
            imprintId: req.body.imprintId,
            parent: req.params.id,
            isFactor: req.body.isFactor
        }

        const variable = await variableRepository.addChildrenToVariable(req.params.id, datas, req.body.definitions, req.body.names, req.body.problems);
        // let imprint = await footprintRepository.addVariableToFootprint(req.params.id, variable._id);
        return res.status(200).json({message: "variable saved sucessfuly", variable})
    } catch (error) {
        logger.error('Error when adding variable to imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {

        const variable = await variableRepository.deleteVariableAndChildren(req.params.id);
        // let imprint = await footprintRepository.addVariableToFootprint(req.params.id, variable._id);
        return res.status(200).send("Variable deleted successfuly");
    } catch (error) {
        logger.error('Error when deleting variable to imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

router.get('/:id', async (req, res) => {
    try {

        const variable = await variableRepository.getVariableById(req.params.id);
        // let imprint = await footprintRepository.addVariableToFootprint(req.params.id, variable._id);
        return res.status(200).send(variable)
    } catch (error) {
        logger.error('Error when deleting variable to imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})


router.put('/update/:id', validateSchema(variableUpdateSchema), async (req, res) => {
    try {
        let datas = {
            imprintId: req.body.imprintId,
            parent: req.params.id,
            isFactor: req.body.isFactor
        }
        const variable = await variableRepository.updateVariable(req.params.id, datas, req.body.definitions, req.body.names, req.body.problems);
        // let imprint = await footprintRepository.addVariableToFootprint(req.params.id, variable._id);
        return res.status(200).json({message: "variable saved sucessfuly", variable})
    } catch (error) {
        logger.error('Error when updated variable to imprint', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

module.exports = router;