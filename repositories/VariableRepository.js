require('dotenv').config();

const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Weight = require('../models/Weight');
const Question = require('../models/Question');
const Proposition = require('../models/Proposition');
const DefinitionTranslation = require('../models/DefinitionTranslation');
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const VariableTranslation = require("../models/VariableTranslation");

class VariableRepository {
    async create(datas, names, problems) {
        try {
            const englishName = names.filter(name => name.isoCode === 'en');

            const englishProblem = problems.filter(problem => problem.isoCode === 'en');

            datas.name = englishName[0].name;
            datas.problem = englishProblem[0].problem;
            const variable = await Variable.create(datas);

            if (!variable) {
                throw new Error('Error when registring variable')
            }

            await Promise.all(names.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.create({ label: value.name, languageId: language._id, variableId: variable._id, type: 'Name' });
                    return language._id;
                }
            }))

            await Promise.all(problems.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.create({ label: value.name, languageId: language._id, variableId: variable._id, type: 'Problem' });
                    return language._id;
                }
            }))
            return variable;
        } catch (error) {
            console.error("Erreur lors de l'ajout de la variable:", error);
            throw error;
        }
    }

    async removeVariable(variableId) {
        try {
            // Supprimer la variable elle-même
            await Variable.findByIdAndDelete(variableId);

            // Supprimer cette variable de toutes les autres variables qui la référencent
            await Variable.updateMany({ variables: variableId }, { $pull: { variables: variableId } });

            // Supprimer cette variable de toutes les empreintes qui la référencent
            await Imprint.updateMany({ variables: variableId }, { $pull: { variables: variableId } });
        } catch (error) {
            console.error("Erreur lors de la suppression de la variable:", error);
            throw error;
        }
    }

    async removeFactorFromVariable(variableId, factorId) {
        try {
            const variable = await Variable.findById(variableId);
            variable.factors.pull(factorId); // Retirer le facteur du tableau des facteurs
            return Variable.updateOne(variable);
        } catch (error) {
            console.error("Erreur lors de la suppression du facteur de la variable:", error);
            throw error;
        }
    }

    async addFactorToVariable(variableId, factorId) {
        try {
            const variable = await Variable.findById(variableId);
            variable.factors.push(factorId);
            return await Variable.updateOne(variable);
        } catch (error) {
            console.error("Erreur lors de l'ajout du facteur à la variable:", error);
            throw error;
        }
    }

    async addVariableToVariable(parentVariableId, childVariableId) {
        try {
            const parentVariable = await Variable.findById(parentVariableId);
            parentVariable.variables.push(childVariableId);
            return await Variable.updateOne(parentVariable)
        } catch (error) {
            console.error("Erreur lors de l'ajout de la variable à la variable:", error);
            throw error;
        }
    }

    async getVariablesByCompany(companyId) {
        try {
            // Récupérer les variables avec leurs facteurs
            const variablesWithFactors = await Variable.aggregate([
                {
                    $lookup: {
                        from: 'factors',
                        localField: '_id',
                        foreignField: 'variableId',
                        as: 'factors'
                    }
                }
            ]);

            // Pour chaque variable, ajouter les poids correspondants aux facteurs
            const variablesWithWeights = await Promise.all(variablesWithFactors.map(async (variable) => {
                // Pour chaque facteur de la variable
                const promises = variable.factors.map(async (factor) => {
                    // Récupérer le poids le plus récent pour ce facteur et cette société
                    const weight = await Weight.findOne({ factorId: factor._id, companyId })
                        .sort({ createdAt: -1 })
                        .limit(1);

                    // Si un poids est trouvé, utiliser sa valeur, sinon utiliser le poids par défaut
                    console.log(factor.dafaultWeight)
                    if (weight !== undefined && weight !== null) {
                        factor.latestWeight = weight.value;
                    }
                    if (weight === undefined || weight === null) {
                        factor.latestWeight = factor.dafaultWeight;
                    }
                    console.log(factor)
                    return factor;
                });


//              Attendre que toutes les promesses se résolvent
                await Promise.all(promises);

                return {
                    _id: variable._id,
                    name: variable.name,
                    factors: variable.factors
                };
            }));

            return variablesWithWeights;

        } catch (error) {
            throw error;
        }
    }

    // add children to variable
    async addChildrenToVariable(parentVariableId, datas, definitions, names, problems) {
        try {
            const englishName = names.filter(name => name.isoCode === 'en');

            const englishProblem = problems.filter(problem => problem.isoCode === 'en');

            if (datas.isFactor) {
                const englishDefinition = definitions.filter(definition => definition.isoCode === 'en');
                datas.definition = englishDefinition[0].label;
            }

            datas.name = englishName[0].name;
            datas.problem = englishProblem[0].problem;
            const variable = await Variable.create(datas);

            if (!variable) {
                throw new Error('Error when registring variable')
            }

            await Promise.all(names.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.create({ label: value.name, languageId: language._id, variableId: variable._id, type: 'Name' });
                    return language._id;
                }
            }))

            await Promise.all(problems.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.create({ label: value.name, languageId: language._id, variableId: variable._id, type: 'Problem' });
                    return language._id;
                }
            }))

            if (datas.isFactor) {
                //add variable definition in all system languages
                /*await Promise.all(definitions.map(async (definition) => {
                    const language = await Language.findOne({ isoCode: definition.isoCode });
                    if (language) {
                        await DefinitionTranslation.create({ label: definition.label, languageId: language._id, variableId: variable._id });
                        return language._id;
                    }
                }))*/

                await Promise.all(definitions.map(async (definition) => {
                    const language = await Language.findOne({ isoCode: definition.isoCode });
                    if (language) {
                        await VariableTranslation.create({ label: definition.label, languageId: language._id, variableId: variable._id, type: 'Definition' });
                        return language._id;
                    }
                }))
            }
            const parentVariable = await Variable.findById(parentVariableId);
            if (!parentVariable) {
                throw new Error('Parent Variable not found');
            }

            // Ajouter les enfants à la variable parent
            if (!parentVariable.children) {
                parentVariable.children = [];
            }
            console.log(parentVariable, variable._id)
            parentVariable.children.push(variable._id);

            // Enregistrer la variable parent mise à jour
            return await parentVariable.save();


        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async deleteVariableAndChildren(variableId) {
        try {
            // Retrieve the variable to delete
            const variableToDelete = await Variable.findById(variableId);
            if (!variableToDelete) {
                throw new Error('Variable not found');
            }

            //Delete variable translate
            await VariableTranslation.deleteMany({variableId})
            //await DefinitionTranslation.deleteMany({variableId})

            // If the variable has children, recursively delete each child
            if (variableToDelete.children.length > 0) {
                await Promise.all(variableToDelete.children.map(async (childId) => {
                    await this.deleteVariableAndChildren(childId);
                }));
            }

            // If the variable is a leaf (has no children), delete associated questions and propositions
            if (variableToDelete.children.length === 0) {
                // Retrieve IDs of associated questions
                const questionIds = await Question.find({ variableId: variableId }).distinct('_id');

                await QuestionTranslation.deleteMany({ questionId: { $in: questionIds } })

                // Delete questions associated with the variable
                await Question.deleteMany({ variableId: variableId });

                const propositionIds = await Proposition.find({ questionId: { $in: questionIds } }).distinct('_id');
                // Delete propositions associated with the questions
                await Proposition.deleteMany({ questionId: { $in: questionIds } });
            }

            // Delete the variable
            await Variable.findByIdAndDelete(variableId);

            // Remove the variable to be deleted as a child of its parent
            const parentVariable = await Variable.findById(variableToDelete.parent);
            if (parentVariable) {
                parentVariable.children.pull(variableId);
                await parentVariable.save();
            }

            return variableToDelete;
        } catch (error) {
            console.error('Error deleting variable and its children:', error);
            throw error;
        }
    }

    async updateVariable(variableId, datas, definitions, names, problems) {
        try {
            // found parent variable
            const englishName = names.filter(name => name.isoCode === 'en');

            if (datas.isFactor) {
                const englishDefinition = definitions.filter(definition => definition.isoCode === 'en');
                datas.definition = englishDefinition[0].label;
            }

            datas.name = englishName[0].name;
            const variable = await Variable.updateOne({_id: variableId});

            if (!variable) {
                throw new Error('Error when registring variable')
            }

            await Promise.all(names.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.updateOne({ languageId: language._id, variableId: variable._id , type: 'Name'}, {label: value.name});
                    return language._id;
                }
            }))

            await Promise.all(problems.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    await VariableTranslation.updateOne({ languageId: language._id, variableId: variable._id , type: 'Problem'}, {label: value.name});
                    return language._id;
                }
            }))

            if (datas.isFactor) {
                //add variable definition in all system languages
                await Promise.all(definitions.map(async (definition) => {
                    const language = await Language.findOne({ isoCode: definition.isoCode });
                    if (language) {
                        await VariableTranslation.updateOne({languageId: language._id, variableId: variable._id, type: 'Definition' }, {label: definition.label });
                        return language._id;
                    }
                }))
            }
            // Enregistrer la variable parent mise à jour
            return variable;


        } catch (error) {
            console.log(error)
            throw error;
        }
    }


    async getVariableById(variableId) {
        try {
            const variable = await Variable.findById(variableId);
            if (!variable) {
                throw new Error('Variable not found');
            }
            const names = await VariableTranslation.find({variableId: variable._id, type: 'Name' });
            const definitions = await VariableTranslation.find({variableId: variable._id, type: 'Definition' });
            const problems = await VariableTranslation.find({variableId: variable._id, type: 'Problem' });
            return {variable, names, definitions, problems};
        } catch (error) {
            console.log(error);
            throw error;
        }0
    }

}

const variableRepository = new VariableRepository();
module.exports = variableRepository;