const Joi = require('joi');
const express = require('express');
const examRepository = require('../../../repositories/ExamRepository');
const router = express.Router();
const logger = require('../../../logger');
const authMiddleware = require('../../../middlewares/authenticate.middleware');
const validateSchema = require('../../../middlewares/validationSchema');
const asyncHandler = require('../../../middlewares/asyncHandler');

const examCreateSchema = Joi.object({
    personId: Joi.string().required(),
    aim: Joi.string().required(),
    amount: Joi.number().required(),
    programId: Joi.string().required(),
});

/**
 * @route POST /create
 * @desc Create a new exam
 * @access Public
 * @param {Object} body - Exam data including institutionId, personId, aim, and amount
 */
router.post(
    '/create',
    validateSchema(examCreateSchema),
    asyncHandler(async (req, res) => {
        const exam = {
            personId: req.body.personId,
            aim: req.body.aim,
            amount: req.body.amount,
            programId: req.body.programId
        };
        const response = await examRepository.create(exam);
        res.status(201).send(response);
    })
);

<<<<<<< Updated upstream
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
=======
/**
 * @route GET /:personId
 * @desc Get all exams for a specific person
 * @access Public
 * @param {string} personId - The ID of the person
 */
router.get(
    '/:personId',
    asyncHandler(async (req, res) => {
        const exams = await examRepository.getExamByPersonId(req.params.personId);
        let response = [];

        await Promise.all(
            exams.map(async (exam) => {
                const indiceAvailable = await imprintRepository.getAvailableExam(exam.exam._id);
                response.push({ exam: exam.exam, indiceAvailable });
            })
        );
        return res.status(200).send(response);
    })
);
>>>>>>> Stashed changes

/**
 * @route GET /details/:examId
 * @desc Get details of an exam by ID
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/details/:examId',
    asyncHandler(async (req, res) => {
        const response = await examRepository.getExamById(req.params.examId);
        res.status(200).send(response);
    })
);

module.exports = router;
