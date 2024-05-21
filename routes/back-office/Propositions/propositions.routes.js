const Joi = require('joi');
const express = require('express');
const propositionRepository = require('../../../repositories/PropositionRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");


router.post('/', async (req, res) => {
    try {
        const response = await propositionRepository.create(req.body.proposition, req.body.translation);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when creating the proposition and its translations:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:questionId', async (req, res) => {
    try {
        const response = await propositionRepository.findPropositionByQuestionId(req.params.questionId);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting the proposition and its translations for question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const response = await propositionRepository.deteleProposition(req.params.id);
        res.status(200).send("Prosition deleted");
    } catch (error) {
        logger.error("Error when deleting the proposition and its translations for question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;