const Joi = require('joi');
const express = require('express');
const questionService = require('../../../services/QuestionService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

const asyncHandler = require('../../../middlewares/asyncHandler');



/**
 * @route POST /questions
 * @desc Create a new question with translations
 * @access Public
 */
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { variableId, questions, datas } = req.body;
        const createdQuestion = await questionService.createQuestionWithTranslations(variableId, questions, datas);
        res.status(201).json(createdQuestion);
    })
);

/**
 * @route GET /questions/variable/:id
 * @desc Retrieve questions associated with a specific variable
 * @access Public
 */
router.get(
    '/variable/:id',
    asyncHandler(async (req, res) => {
        const questions = await questionService.retrieveQuestionFromAVariable(req.params.id);
        res.status(200).json(questions);
    })
);



module.exports = router;
