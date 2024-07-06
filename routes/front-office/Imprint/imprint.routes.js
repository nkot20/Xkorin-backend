const Joi = require('joi');
const express = require('express');
const router = express.Router();
const imprintRepository = require('../../../repositories/ImprintRepository');
const logger = require("../../../logger");

router.get("/variable-questions/:profilId/:subcategoryId/:isoCode", async (req, res) => {
    try {
        const response = await imprintRepository.getVariablesForImprints(req.params.subcategoryId, req.params.isoCode, req.params.profilId)
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting questions', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
})

// calcul score imprint
router.get("/score/:id", async (req, res) => {
    try {
        const response = await imprintRepository.calulateImprintValue(req.params.id);
        return res.status(200).send({score: response});
    } catch (error) {
        logger.error('Error when getting imprint score', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

router.get("/dashboard/:examId", async (req, res) => {
    try {
        const response = await imprintRepository.buildVariableTree(req.params.examId);
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting dashboard exam', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

//get confidence inclusif index
router.get("/cii/:examId", async (req, res) => {
    try {
        const response = await imprintRepository.getConfidenceIndex(req.params.examId);
        return res.status(200).send({score: response});
    } catch (error) {
        logger.error('Error when getting index', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

// get stat, min, max, average of all population
router.get("/statistics", async (req, res) => {
    try {
        const response = await imprintRepository.calculateImprintStatisticsForAllExams();
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting statistics', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});

//get exam imprints values
router.get("/imprints-values/:examId", async (req, res) => {
    try {
        const response = await imprintRepository.getValueToEachImprint(req.params.examId);
        return res.status(200).send(response);
    } catch (error) {
        logger.error('Error when getting imprints value', { error: error });
        return res.status(400).json({
            error: error.message,
        });
    }
});
module.exports = router;