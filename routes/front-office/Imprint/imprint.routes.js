const Joi = require('joi');
const express = require('express');
const router = express.Router();
const imprintRepository = require('../../../repositories/ImprintRepository');
const logger = require("../../../logger");
const asyncHandler = require('../../../middlewares/asyncHandler');

/**
 * @route GET /variable-questions/:profilId/:subcategoryId/:isoCode
 * @desc Get variable questions for imprints
 * @access Public
 * @param {string} profilId - The ID of the profile
 * @param {string} subcategoryId - The ID of the subcategory
 * @param {string} isoCode - The ISO code for the language
 */
router.get(
    '/variable-questions/:profilId/:subcategoryId/:isoCode',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getVariablesForImprints(
            req.params.subcategoryId,
            req.params.isoCode,
            req.params.profilId
        );
        return res.status(200).send(response);
    })
);

/**
 * @route GET /remaining-variables/:profilId/:subcategoryId/:isoCode/:examId
 * @desc Get remaining variable questions for imprints
 * @access Public
 * @param {string} profilId - The ID of the profile
 * @param {string} subcategoryId - The ID of the subcategory
 * @param {string} isoCode - The ISO code for the language
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/remaining-variables/:profilId/:subcategoryId/:isoCode/:examId',
    asyncHandler(async (req, res) => {
        const { profilId, subcategoryId, isoCode, examId } = req.params;
        const remainingVariables = await imprintRepository.getRemainingVariablesForImprints(
            subcategoryId,
            isoCode,
            profilId,
            examId
        );
        return res.status(200).json(remainingVariables);
    })
);


/**
 * @route GET /is-exam-complete/:subcategoryId/:examId
 * @desc Check if an exam is complete
 * @access Public
 * @param {string} subcategoryId - The ID of the subcategory
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/is-exam-complete/:subcategoryId/:examId',
    asyncHandler(async (req, res) => {
        const { subcategoryId, examId } = req.params;
        try {
            const isComplete = await imprintRepository.isExamComplete(subcategoryId, examId);
            return res.status(200).json({ isComplete });
        } catch (error) {
            console.error('Error checking if exam is complete:', error);
            return res.status(500).json({ error: 'An error occurred while checking if the exam is complete.' });
        }
    })
);

/**
 * @route GET /score/:id
 * @desc Calculate the imprint score
 * @desc Retrieves the score for a specific imprint ID
 * @access Public
 * @param {string} id - The ID of the imprint
 */
router.get(
    '/score/:id',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.calculateImprintValue(req.params.id);
        return res.status(200).send({ score: response });
    })
);

/**
 * @route GET /dashboard/:examId
 * @desc Get dashboard data for an exam
 * @desc Builds a variable tree for a specific exam ID
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/dashboard/:examId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.buildVariableTree(req.params.examId);
        return res.status(200).send(response);
    })
);

/**
 * @route GET /dashboard/:examId
 * @desc Get dashboard data for an exam
 * @desc Builds a variable tree for a specific exam ID
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/dashboard/:examId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.buildVariableTree(req.params.examId);
        return res.status(200).send(response);
    })
);


/**
 * @route GET /get-certificate-and-dashboard/:examId
 * @desc Get generated file for exam
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/get-certificate-and-dashboard/:examId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.buildVariableTree(req.params.examId);
        return res.status(200).send(response);
    })
);


/**
 * @route GET /cii/:examId
 * @desc Get confidence inclusive index
 * @desc Retrieves the confidence index score for a specific exam ID
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/cii/:examId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getConfidenceIndex(req.params.examId);
        return res.status(200).send({ score: response });
    })
);

/**
 * @route GET /statistics
 * @desc Get statistics for all exams
 * @desc Retrieves statistical data (min, max, average) for all exams
 * @access Public
 */
router.get(
    '/statistics',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.calculateImprintStatisticsForAllExams();
        return res.status(200).send(response);
    })
);

/**
 * @route GET /imprints-values/:examId
 * @desc Get values for each imprint in an exam
 * @desc Retrieves values for each imprint in a specific exam ID
 * @access Public
 * @param {string} examId - The ID of the exam
 */
router.get(
    '/imprints-values/:examId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getValueToEachImprint(req.params.examId);
        return res.status(200).send(response);
    })
);

/**
 * @route GET /:institutionId/evolution/:personId
 * @desc Get inclusive confidence index evolution for all exams concerning an institution
 * @desc Retrieves the evolution of confidence indices and imprint values for each exam
 * @access Public
 * @param {string} institutionId - The ID of the institution
 * @param {string} personId - The ID of the person
 */
router.get(
    '/:institutionId/evolution/:personId',
    asyncHandler(async (req, res) => {
        const response = await imprintRepository.getDatasForEachExam(req.params.institutionId, req.params.personId);
        return res.status(200).send(response);
    })
);

module.exports = router;


module.exports = router;