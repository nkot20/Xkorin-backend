require('dotenv').config();
const Proposition = require('../models/Proposition');
const PropositionTranslation = require('../models/PropositionTranslation');
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const {ObjectId} = require("mongodb");

class PropositionRepository {
    async create(payload, translations) {
        try {
            const englishProposition = translations.filter(proposition => proposition.isoCode === 'en');
            const proposition = await Proposition.create({label: englishProposition[0].label, value: payload.value, questionId: payload.questionId});
            await Promise.all(translations.map(async (propositionTranslation) => {
                const language = await Language.findOne({ isoCode: propositionTranslation.isoCode });
                if (language) {
                    await PropositionTranslation.create({ label: propositionTranslation.label, languageId: language._id, propositionId: proposition._id });
                    return language._id;
                }
            }));
            return proposition;
        } catch (error) {
            console.error("Erreur lors de l'ajout du de la proposition: ", error);
            throw error;
        }
    }

    async findPropositionByQuestionId(id) {
        try {
            const propositions = await Proposition.find({questionId: id});
            let response = [];
            await Promise.all(propositions.map(async (proposition) => {
                const propostionTranslations = await PropositionTranslation.find({propositionId: proposition._id});
                let translation = '';
                propostionTranslations.forEach(value => {
                    translation += value.label + ' / '
                })
                translation = translation.substring(0, translation.length - 2)
                translation =  translation + ' (' + proposition.value + ')';
                response.push({proposition, translation});
            }))
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deteleProposition(id) {
        try {
            await PropositionTranslation.deleteMany({propositionId: id});
            return await Proposition.deleteOne({_id: new ObjectId(id)})
        } catch (error) {
            throw error;
        }
    }


    async  getPropositionsGroupedByHierarchy() {
        try {
            const propositions = await Proposition.aggregate([
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'questionId',
                        foreignField: '_id',
                        as: 'question'
                    }
                },
                {
                    $unwind: '$question'
                },
                {
                    $lookup: {
                        from: 'factors',
                        localField: 'question.factorId',
                        foreignField: '_id',
                        as: 'factor'
                    }
                },
                {
                    $unwind: '$factor'
                },
                {
                    $lookup: {
                        from: 'variables',
                        localField: 'factor.variableId',
                        foreignField: '_id',
                        as: 'variable'
                    }
                },
                {
                    $unwind: '$variable'
                },
                {
                    $lookup: {
                        from: 'footprints',
                        localField: 'variable.footprintId',
                        foreignField: '_id',
                        as: 'footprint'
                    }
                },
                {
                    $unwind: '$footprint'
                },
                {
                    $group: {
                        _id: {
                            footprint: '$footprint.name',
                            variable: '$variable.name',
                            factor: '$factor.name',
                            question: '$question.label',
                            questionId: '$question._id',
                            questionType: '$question.type'
                        },
                        propositions: { $push: '$$ROOT' }
                    }
                },
                {
                    $group: {
                        _id: {
                            footprint: '$_id.footprint',
                            variable: '$_id.variable',
                            factor: '$_id.factor'
                        },
                        questions: {
                            $push: {
                                _id: '$_id.questionId',
                                question: '$_id.question',
                                type: '$_id.questionType',
                                propositions: '$propositions'
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            footprint: '$_id.footprint',
                            variable: '$_id.variable'
                        },
                        factors: {
                            $push: {
                                factor: '$_id.factor',
                                questions: '$questions'
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            footprint: '$_id.footprint'
                        },
                        variables: {
                            $push: {
                                variable: '$_id.variable',
                                factors: '$factors'
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        footprints: {
                            $push: {
                                footprint: '$_id.footprint',
                                variables: '$variables'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        footprints: 1
                    }
                }
            ]);

            return propositions;
        } catch (error) {
            console.error("Erreur lors de la récupération des propositions:", error);
            throw error;
        }
    }

}



const propositionRepository = new PropositionRepository();
module.exports = propositionRepository;