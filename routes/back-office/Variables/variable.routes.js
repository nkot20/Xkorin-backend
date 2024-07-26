const Joi = require('joi');
const express = require('express');
const impRepository = require('../../../repositories/ImprintRepository');
const variableRepository = require('../../../repositories/VariableRepository');
const validateSchema = require("../../../middlewares/validationSchema");
const logger = require("../../../logger");
const router = express.Router();
const asyncHandler = require('../../../middlewares/asyncHandler');

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
 * @route POST /variables/create
 * @desc Add a new variable to an imprint
 * @access Public
 */
router.post(
    '/create',
    validateSchema(variableImprintCreateSchema),
    asyncHandler(async (req, res) => {
        const datas = {
            name: req.body.name,
            imprintId: req.body.imprintId,
        };
        const variable = await variableRepository.create(datas, req.body.names, req.body.problems);
        res.status(201).json({ message: 'Variable saved successfully', variable });
    })
);

/**
 * @route PATCH /variables/add/child/:id
 * @desc Add a child variable to a parent variable
 * @param {string} id - Parent variable ID
 * @access Public
 */
router.patch(
    '/add/child/:id',
    validateSchema(variableCreateSchema),
    asyncHandler(async (req, res) => {
        const datas = {
            imprintId: req.body.imprintId,
            parent: req.params.id,
            isFactor: req.body.isFactor,
        };
        const variable = await variableRepository.addChildrenToVariable(req.params.id, datas, req.body.definitions, req.body.names, req.body.problems);
        res.status(201).json({ message: 'Variable saved successfully', variable });
    })
);

/**
 * @route DELETE /variables/delete/:id
 * @desc Delete a variable and its children by ID
 * @access Public
 */
router.delete(
    '/delete/:id',
    asyncHandler(async (req, res) => {
        const variable = await variableRepository.deleteVariableAndChildren(req.params.id);
        res.status(200).json({ message: 'Variable deleted successfully', variable });
    })
);

/**
 * @route GET /variables/:id
 * @desc Retrieve a variable by ID
 * @access Public
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const variable = await variableRepository.getVariableById(req.params.id);
        res.status(200).json(variable);
    })
);

/**
 * @route PUT /variables/update/:id
 * @desc Update a variable by ID
 * @access Public
 */
router.put(
    '/update/:id',
    validateSchema(variableUpdateSchema),
    asyncHandler(async (req, res) => {
        const datas = {
            imprintId: req.body.imprintId,
            isFactor: req.body.isFactor,
        };
        const variable = await variableRepository.updateVariable(req.params.id, datas, req.body.definitions, req.body.names, req.body.problems);
        res.status(200).json({ message: 'Variable updated successfully', variable });
    })
);
module.exports = router;