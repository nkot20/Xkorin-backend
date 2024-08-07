const Joi = require('joi');
const express = require('express');
const imprintRepository = require('../../../repositories/ImprintRepository');
const variableRepository = require('../../../repositories/VariableRepository');
const validateSchema = require('../../../middlewares/validationSchema');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const asyncHandler = require('../../../middlewares/asyncHandler');
const footprintCreateSchema = Joi.object({
    name: Joi.string().required(),
    color: Joi.string().required(),
});


// Création d'un nouvel imprint
router.post(
    '/',
    validateSchema(footprintCreateSchema),
    asyncHandler(async (req, res) => {
        const footprint = await imprintRepository.createFootprint(req.body);
        res.status(200).json({ message: 'Imprint saved successfully', footprint });
    })
);

// Récupération de tous les imprints
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getAll();
        res.status(200).send(response);
    })
);

// Récupération de l'arbre de variables d'imprint
router.get(
    '/tree',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getFootprintVariableTree();
        res.status(200).send(response);
    })
);


module.exports = router;