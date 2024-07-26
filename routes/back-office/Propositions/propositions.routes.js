const Joi = require('joi');
const express = require('express');
const propositionRepository = require('../../../repositories/PropositionRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");
const asyncHandler = require('../../../middlewares/asyncHandler');

/**
 * @route POST /propositions
 * @desc Create a new proposition along with its translations
 * @access Public
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const response = await propositionRepository.create(req.body.proposition, req.body.translation);
        res.status(201).json(response);
    })
);

/**
 * @route GET /propositions/:questionId
 * @desc Retrieve propositions by question ID
 * @access Public
 */
router.get(
    '/:questionId',
    asyncHandler(async (req, res) => {
        const response = await propositionRepository.findPropositionByQuestionId(req.params.questionId);
        res.status(200).json(response);
    })
);

/**
 * @route DELETE /propositions/:id
 * @desc Delete a proposition and its translations by ID
 * @access Public
 */
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const response = await propositionRepository.deteleProposition(req.params.id);
        res.status(200).json({ message: 'Proposition deleted', response });
    })
);

module.exports = router;