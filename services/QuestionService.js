// services/QuestionService.js
const QuestionRepository = require('../repositories/QuestionRepository');
const variableRepository = require('../repositories/VariableRepository');
const profilService = require('../services/ProfilService');

class QuestionService {
    async createQuestionWithTranslations(variableId, questions, datas) {
        try {
            const englishQuestion = questions.find(question => question.isoCode === 'en');
            if (!englishQuestion) {
                throw new Error('English translation is required');
            }

            const createdQuestions = await Promise.all(datas.profils.map(async (profil) => {
                const createdQuestion = await QuestionRepository.createQuestion({
                    label: englishQuestion.label,
                    type: 'radio',
                    variableId,
                    weighting: datas.weighting,
                    profilId: profil
                });

                await Promise.all(questions.map(async (question) => {
                    const language = await QuestionRepository.findLanguageByIsoCode(question.isoCode);
                    if (language) {
                        await QuestionRepository.createQuestionTranslation({
                            label: question.label,
                            languageId: language._id,
                            questionId: createdQuestion._id
                        });
                    }
                }));

                return createdQuestion;
            }));

            return createdQuestions;
        } catch (error) {
            console.error("Error creating question with translations:", error);
            throw error;
        }
    }

    async retrieveQuestionFromAVariable(variableId) {
        try {
            const variable = await variableRepository.getVariableById(variableId);
            const questions = await QuestionRepository.findQuestionsByVariableId(variableId);
            const response = [];

            await Promise.all(questions.map(async (question) => {
                const profil = await profilService.getProfilById(question.profilId);
                const questionTranslations = await QuestionRepository.findQuestionTranslations(question._id);
                const labelQuestionWithOthersLanguages = questionTranslations.map(q => q.label).join(' / ');

                if (!question.weighting) {
                    const propositions = await QuestionRepository.findPropositionsByQuestionId(question._id);
                    const propositionsTranslation = await Promise.all(propositions.map(async (proposition) => {
                        const propositionTranslations = await QuestionRepository.findPropositionTranslations(proposition._id);
                        return { _id: proposition._id, labels: propositionTranslations };
                    }));

                    response.push({
                        _id: question._id,
                        weighting: question.weighting,
                        question: labelQuestionWithOthersLanguages,
                        propositionsTranslation,
                        profil
                    });
                } else {
                    response.push({
                        _id: question._id,
                        weighting: question.weighting,
                        question: labelQuestionWithOthersLanguages,
                        profil
                    });
                }
            }));

            return { variable, questions: response };
        } catch (error) {
            console.error("Error retrieving question from a variable:", error);
            throw error;
        }
    }
}

module.exports = new QuestionService();
