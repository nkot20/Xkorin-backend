const Joi = require('joi');
const express = require('express');
const answerRepository = require('../../../repositories/AnswerRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

const questionOptionSchema = Joi.object({
    questionId: Joi.string().required(),
    optionId: Joi.string().required(),
    examId: Joi.string().required(),
});

const schemaAnswer = Joi.array().items(questionOptionSchema);

router.post('/create', validateSchema(schemaAnswer), async (req, res) => {
    try {

        const response = await answerRepository.create(req.body);
        res.status(201).send(response);
    } catch (error) {
       throw error;
    }
})





module.exports = router;