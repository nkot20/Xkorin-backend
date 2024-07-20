const Joi = require('joi');
const express = require('express');
const examRepository = require('../../../repositories/ExamRepository');
const imprintRepository = require('../../../repositories/ImprintRepository');
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
        const exams = await examRepository.getExamByPersonId(req.params.personId);
        let response = [];

        await Promise.all(exams.map(async (exam) => {
            const indiceAvailable = await imprintRepository.getAvailableExam(exam.exam._id);
            response.push({ exam: exam.exam, indiceAvailable });
        }));
        return res.status(201).send(response);
    } catch (error) {
        logger.error("Error when getting person exam", error);
        return res.status(500).json({ message: 'Error when getting person exam' });
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