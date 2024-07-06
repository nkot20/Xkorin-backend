const Joi = require('joi');
const express = require('express');
const examRepository = require('../../../repositories/ExamRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require("../../../middlewares/validationSchema");

const examCreateSchema = Joi.object({
    institutionId: Joi.string().required(),
    personId: Joi.string().required(),
    aim: Joi.string().required(),
    amount: Joi.number().required()
});


router.post('/create', validateSchema(examCreateSchema), async (req, res) => {
    try {
        const exam = {
            institutionId: req.body.institutionId,
            personId: req.body.personId,
            aim: req.body.aim,
            amount: req.body.amount
        }
        const response = await examRepository.create(exam);
        res.status(201).send(response);
    } catch (error) {
       throw error;
    }
})

//get all person exams
router.get('/:personId', async (req, res) => {
    try {
        const response = await examRepository.getExamByPersonId(req.params.personId);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting person exam", error);
        res.status(500).json({ message: 'Error when getting person exam' });
    }
});

//exam details
router.get('/details/:examId', async (req, res) => {
    try {
        const response = await examRepository.getExamById(req.params.examId);
        res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting person exam", error);
        res.status(500).json({ message: 'Error when getting person exam' });
    }
});



module.exports = router;