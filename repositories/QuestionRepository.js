require('dotenv').config();
const Question = require('../models/Question');
const Language = require('../models/Language');
const QuestionTranslation = require('../models/QuestionTranslation');
const DefinitionTranslation = require('../models/DefinitionTranslation');
const Proposition = require('../models/Proposition');
const PropositionTranslation = require('../models/PropositionTranslation');

class QuestionRepository {
    async create(question) {
        try {
            return await Question.create(question);
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

    // Fonction dans le repository pour enregistrer une question et ses traductions
    async createQuestionWithTranslations(variableId, questions, definitions) {
        try {
            const englishQuestion = questions.filter(question => question.isoCode === 'en');
            // Enregistrer la question principale
            const createdQuestion = await Question.create({ label: englishQuestion[0].label, type: 'radio', variableId });


            await Promise.all(questions.map(async (question) => {

                const language = await Language.findOne({ isoCode: question.isoCode });
                if (language) {
                    await QuestionTranslation.create({ label: question.label, languageId: language._id, questionId: createdQuestion._id });
                    return language._id;
                }
            }));

            return createdQuestion;
        } catch (error) {
            console.error("Erreur lors de la création de la question et de ses traductions:", error);
            throw error;
        }
    }

    async retrieveQuestionFromAVariable(variableId) {
        try {
            const question = await Question.findOne({variableId});
            if (question) {
                const questionsTranslation =  await QuestionTranslation.find({questionId: question._id});
                let labelQuestionWithOthersLanguages = '';
                questionsTranslation.forEach(question => {
                    labelQuestionWithOthersLanguages += question.label + ' / ';
                });
                const propositions = await Proposition.find({questionId: question._id});
                let propositionsTranslation = [];
                await Promise.all(propositions.map(async (proposition) => {
                    const propositionTranslation = await PropositionTranslation.find({propositionId: proposition._id});
                    propositionsTranslation.push({_id: proposition._id, labels: propositionTranslation});
                }));
                return {_id: question._id, question: labelQuestionWithOthersLanguages, propositionsTranslation};
            } else {
                return question
            }
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }
}

const questionRepository = new QuestionRepository();
module.exports = questionRepository;