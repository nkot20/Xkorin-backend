// repositories/QuestionRepository.js
const Question = require('../models/Question');
const Language = require('../models/Language');
const QuestionTranslation = require('../models/QuestionTranslation');
const Proposition = require('../models/Proposition');
const PropositionTranslation = require('../models/PropositionTranslation');

class QuestionRepository {
    async createQuestion(questionData) {
        try {
            return await Question.create(questionData);
        } catch (error) {
            console.error("Error creating question: ", error);
            throw error;
        }
    }

    async createQuestionTranslation(translationData) {
        try {
            return await QuestionTranslation.create(translationData);
        } catch (error) {
            console.error("Error creating question translation: ", error);
            throw error;
        }
    }

    async findLanguageByIsoCode(isoCode) {
        try {
            return await Language.findOne({ isoCode });
        } catch (error) {
            console.error("Error finding language: ", error);
            throw error;
        }
    }

    async findQuestionsByVariableId(variableId) {
        try {
            return await Question.find({ variableId });
        } catch (error) {
            console.error("Error finding questions: ", error);
            throw error;
        }
    }

    async findQuestionTranslations(questionId) {
        try {
            return await QuestionTranslation.find({ questionId });
        } catch (error) {
            console.error("Error finding question translations: ", error);
            throw error;
        }
    }

    async findPropositionsByQuestionId(questionId) {
        try {
            return await Proposition.find({ questionId });
        } catch (error) {
            console.error("Error finding propositions: ", error);
            throw error;
        }
    }

    async findPropositionTranslations(propositionId) {
        try {
            return await PropositionTranslation.find({ propositionId });
        } catch (error) {
            console.error("Error finding proposition translations: ", error);
            throw error;
        }
    }
}

module.exports = new QuestionRepository();
