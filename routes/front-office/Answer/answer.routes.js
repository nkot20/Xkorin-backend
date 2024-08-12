const Joi = require('joi');
const express = require('express');
const answerService = require('../../../services/AnswerService');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require('../../../middlewares/validationSchema');
const asyncHandler = require('../../../middlewares/asyncHandler');

const questionOptionSchema = Joi.object({
    questionId: Joi.string().required(),
    optionId: Joi.string().required(),
    examId: Joi.string().required(),
});

const schemaAnswer = Joi.array().items(questionOptionSchema);

/**
 * @route POST /create
 * @desc Create answers for questions
 * @access Public
 * @param {Array} body - Array of answer objects containing questionId, optionId, and examId
 */
router.post(
    '/create',
    validateSchema(schemaAnswer),
    asyncHandler(async (req, res) => {
        const response = await answerService.create(req.body);
        res.status(201).send(response);
    })
);

module.exports = router;
