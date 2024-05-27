const Joi = require('joi');
const express = require('express');
const questionRepository = require('../../../repositories/QuestionRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");




// Route pour enregistrer une question et ses traductions
router.post('/', async (req, res) => {
    try {
        const { variableId, questions, datas } = req.body;
        const createdQuestion = await questionRepository.createQuestionWithTranslations(variableId, questions, datas);
        res.status(201).send(createdQuestion);
    } catch (error) {
        logger.error("Error when creating the question and its translations:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// retrieve question from variable
router.get('/variable/:id', async (req, res) => {
    try {
        const questions = await questionRepository.retrieveQuestionFromAVariable(req.params.id);
        res.status(200).send(questions);
    } catch (error) {
        logger.error("Error when searching for variable questions", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
