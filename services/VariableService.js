const VariableRepository = require('../repositories/VariableRepository');
const Language = require("../models/Language");
const Weight = require('../models/Weight');
const Question = require('../models/Question');
const Proposition = require('../models/Proposition');
const imprintInstitutionService = require('../services/ImprintInstitutionService');
const Imprint = require('../models/Imprint');
const Option = require("../models/Option");
const VariableTranslation = require("../models/VariableTranslation")

class VariableService {
    async createVariable(datas, names, problems) {
        try {
            const englishName = names.find(name => name.isoCode === 'en');
            const englishProblem = problems.find(problem => problem.isoCode === 'en');

            if (!englishName || !englishProblem) {
                throw new Error('English name and problem are required');
            }

            datas.name = englishName.name;
            datas.problem = englishProblem.problem;
            const variable = await VariableRepository.create(datas);

            if (!variable) {
                throw new Error('Error when registering variable');
            }

            await this.createTranslations(variable._id, names, problems);

            return variable;
        } catch (error) {
            console.error("Error creating variable:", error);
            throw error;
        }
    }

    async createTranslations(variableId, names, problems) {
        await Promise.all(names.map(async (value) => {
            const language = await Language.findOne({ isoCode: value.isoCode });
            if (language) {
                await VariableRepository.createTranslation({
                    label: value.name,
                    languageId: language._id,
                    variableId: variableId,
                    type: 'Name'
                });
            }
        }));

        await Promise.all(problems.map(async (value) => {
            const language = await Language.findOne({ isoCode: value.isoCode });
            if (language) {
                await VariableRepository.createTranslation({
                    label: value.name,
                    languageId: language._id,
                    variableId: variableId,
                    type: 'Problem'
                });
            }
        }));
    }

    async removeVariable(variableId) {
        try {
            await VariableRepository.findByIdAndDelete(variableId);
            await VariableRepository.updateOne(
                { variables: variableId },
                { $pull: { variables: variableId } }
            );
            await Imprint.updateMany(
                { variables: variableId },
                { $pull: { variables: variableId } }
            );
        } catch (error) {
            console.error("Error removing variable:", error);
            throw error;
        }
    }

    async updateVariable(variableId, datas, definitions, names, problems) {
        try {
            const englishName = names.find(name => name.isoCode === 'en');

            if (!englishName) {
                throw new Error('English name is required');
            }

            datas.name = englishName.name;

            if (datas.isFactor) {
                const englishDefinition = definitions.find(definition => definition.isoCode === 'en');
                if (englishDefinition) {
                    datas.definition = englishDefinition.label;
                }
            }

            const variable = await VariableRepository.updateOne({ _id: variableId }, datas);

            if (!variable) {
                throw new Error('Error updating variable');
            }

            await this.updateTranslations(variableId, names, problems, definitions, datas.isFactor);

            return variable;
        } catch (error) {
            console.error("Error updating variable:", error);
            throw error;
        }
    }

    async updateTranslations(variableId, names, problems, definitions, isFactor) {
        await Promise.all(names.map(async (value) => {
            const language = await Language.findOne({ isoCode: value.isoCode });
            if (language) {
                const translation = await VariableRepository.findTranslation(language._id, variableId, 'Name');
                if (translation.length === 0) {
                    await VariableRepository.createTranslation({
                        languageId: language._id,
                        variableId: variableId,
                        type: 'Name',
                        label: value.name
                    });
                } else {
                    await VariableRepository.updateTranslation(
                        { languageId: language._id, variableId: variableId, type: 'Name' },
                        { label: value.name }
                    );
                }
            }
        }));

        await Promise.all(problems.map(async (value) => {
            const language = await Language.findOne({ isoCode: value.isoCode });
            if (language) {
                const translation = await VariableRepository.findTranslation(language._id, variableId, 'Problem');
                if (translation.length === 0) {
                    await VariableRepository.createTranslation({
                        languageId: language._id,
                        variableId: variableId,
                        type: 'Problem',
                        label: value.label || ' '
                    });
                } else {
                    await VariableRepository.updateTranslation(
                        { languageId: language._id, variableId: variableId, type: 'Problem' },
                        { label: value.label || ' ' }
                    );
                }
            }
        }));

        if (isFactor) {
            await Promise.all(definitions.map(async (value) => {
                const language = await Language.findOne({ isoCode: value.isoCode });
                if (language) {
                    const translation = await VariableRepository.findTranslation(language._id, variableId, 'Definition');
                    if (translation.length === 0) {
                        await VariableRepository.createTranslation({
                            languageId: language._id,
                            variableId: variableId,
                            type: 'Definition',
                            label: value.label || ''
                        });
                    } else {
                        await VariableRepository.updateTranslation(
                            { languageId: language._id, variableId: variableId, type: 'Definition' },
                            { label: value.label || '' }
                        );
                    }
                }
            }));
        }
    }

    async getVariableById(variableId) {
        try {
            const variable = await VariableRepository.findById(variableId);
            if (!variable) {
                throw new Error('Variable not found');
            }

            const language = await Language.find();

            const names = await this.getTranslation(variable._id, 'Name');
            if (names.length === 0) {
                language.forEach(value => {
                    if (value.isoCode === 'en')
                        names.push({ isoCode: 'en', label: variable.name });
                    else
                        names.push({ isoCode: value.isoCode, label: '' })
                })
            }

            const definitions = await this.getTranslation(variable._id, 'Definition');

            const problems = await this.getTranslation(variable._id, 'Problem');
            if (variable.isFactor) {
                if (definitions.length === 0) {
                    language.forEach(value => {
                        definitions.push({ isoCode: value.isoCode, label: '' })
                    })
                }
            }
            if (problems.length === 0) {
                language.forEach(value => {
                    problems.push({ isoCode: value.isoCode, label: '' })
                })
            }

            return { variable, names, definitions, problems };
        } catch (error) {
            console.error("Error retrieving variable by ID:", error);
            throw error;
        }
    }

    async getTranslation(variableId, type) {
        try {
            return await VariableRepository.findTranslations(variableId, type);
        } catch (error) {
            console.error(`Error retrieving ${type} translations:`, error);
            throw error;
        }
    }

    async removeFactorFromVariable(variableId, factorId) {
        try {
            await VariableRepository.updateOne(
                { _id: variableId },
                { $pull: { factors: factorId } }
            );
        } catch (error) {
            console.error("Error removing factor from variable:", error);
            throw error;
        }
    }

    async addFactorToVariable(variableId, factorId) {
        try {
            await VariableRepository.updateOne(
                { _id: variableId },
                { $push: { factors: factorId } }
            );
        } catch (error) {
            console.error("Error adding factor to variable:", error);
            throw error;
        }
    }

    async addVariableToVariable(parentVariableId, childVariableId) {
        try {
            await VariableRepository.updateOne(
                { _id: parentVariableId },
                { $push: { variables: childVariableId } }
            );
        } catch (error) {
            console.error("Error adding child variable to parent variable:", error);
            throw error;
        }
    }

    async getVariablesByCompany(companyId) {
        try {
            return await VariableRepository.findAllByCompanyId(companyId);
        } catch (error) {
            console.error("Error retrieving variables by company:", error);
            throw error;
        }
    }

    async addChildrenToVariable(parentVariableId, datas, definitions, names, problems) {
        try {
            const englishName = names.find(name => name.isoCode === 'en');
            if (!englishName) {
                throw new Error('English name is required');
            }

            datas.name = englishName.name;

            if (datas.isFactor) {
                const englishDefinition = definitions.find(definition => definition.isoCode === 'en');
                if (englishDefinition) {
                    datas.definition = englishDefinition.label;
                }
            }

            const variable = await VariableRepository.create(datas);

            if (!variable) {
                throw new Error('Error when registering variable');
            }

            await this.createTranslations(variable._id, names, problems);

            if (datas.isFactor) {
                await Promise.all(definitions.map(async (value) => {
                    const language = await Language.findOne({ isoCode: value.isoCode });
                    if (language) {
                        await VariableRepository.createTranslation({
                            label: value.label || '',
                            languageId: language._id,
                            variableId: variable._id,
                            type: 'Definition'
                        });
                    }
                }));
            }

            await this.addVariableToVariable(parentVariableId, variable._id);

            return variable;
        } catch (error) {
            console.error("Error adding child variable to parent:", error);
            throw error;
        }
    }

    async deleteVariableAndChildren(variableId) {
        try {
            const variable = await VariableRepository.findById(variableId);
            if (!variable) {
                throw new Error('Variable not found');
            }

            if (variable.variables && variable.variables.length > 0) {
                for (const childId of variable.variables) {
                    await this.deleteVariableAndChildren(childId);
                }
            }

            await VariableRepository.findByIdAndDelete(variableId);
            await Question.deleteMany({ variableId });
            await Proposition.deleteMany({ variableId });
            await VariableRepository.deleteTranslations(variableId);
        } catch (error) {
            console.error("Error deleting variable and its children:", error);
            throw error;
        }
    }

    async getLeafVariablesGroupedByImprints(institutionId, languageIsoCode) {
        try {
            // Lookup to get the language ID based on the ISO code
            const language = await Language.findOne({ isoCode: languageIsoCode });
            if (!language) {
                throw new Error('Language not found');
            }
            const languageId = language._id;

            // Lookup to get the default option with value 7 and isItImportant flag true
            const defaultOption = await Option.findOne({ value: 7, isItImportant: true });
            if (!defaultOption) {
                throw new Error('Default option with value 7 not found or is not marked as important');
            }
            const defaultOptionId = defaultOption._id;

            // Retrieve all imprints
            const imprints = await imprintInstitutionService.getImprintsByInstitution(institutionId);

            // Process each imprint
            const result = await Promise.all(imprints.map(async (imprint) => {
                // Find variables for the current imprint
                const newImprint = await Imprint.findById(imprint.imprintId);
                const variables = await VariableRepository.findByImprintId(imprint.imprintId)

                // Prepare an array to store processed variables
                const processedVariables = await Promise.all(variables.map(async (variable) => {
                    // Find the latest weight for the variable from the weights collection
                    const weight = await Weight.findOne({ variableId: variable._id, institutionId })
                        .sort({ createdAt: -1 })
                        .select('optionId');

                    // Determine the final weight to use
                    const finalWeight = weight ? weight.optionId : defaultOptionId;

                    // Find the variable translation based on language
                    const translation = await VariableTranslation.findOne({
                        variableId: variable._id,
                        type: 'Name',
                        languageId
                    });

                    // Prepare the processed variable object
                    return {
                        _id: variable._id,
                        name: translation ? translation.label : variable.name,
                        weight: finalWeight
                    };
                }));

                // Return the processed imprint with variables
                return {
                    _id: imprint.imprintId,
                    name: imprint.name,
                    status: imprint.status,
                    isAddedForAnInstitution: imprint.isAddedForAnInstitution,
                    number: newImprint.number,
                    variables: processedVariables
                };
            }));

            // Sort the result by imprint number
            result.sort((a, b) => a.number - b.number);

            return result;
        } catch (error) {
            console.error('Error getting leaf variables grouped by imprints:', error);
            throw error;
        }
    }

    async getTranslationsByLanguage(variableIds, languageIsoCode) {
        const language = await Language.findOne({ isoCode: languageIsoCode });
        if (!language) {
            throw new Error('Language not found');
        }

        const translations = await VariableTranslation.find({
            variableId: { $in: variableIds },
            languageId: language._id
        });

        return translations.reduce((acc, translation) => {
            if (!acc[translation.variableId]) {
                acc[translation.variableId] = {};
            }
            acc[translation.variableId][translation.type] = translation.label;
            return acc;
        }, {});
    }

    groupVariablesByImprint(variables, imprints) {
        const grouped = [];

        imprints.forEach(imprint => {
            const matchedVariables = variables.filter(variable => {
                return variable.variables.some(varId => varId.toString() === imprint._id.toString());
            });

            if (matchedVariables.length > 0) {
                grouped.push({ imprint, variables: matchedVariables });
            }
        });

        return grouped;
    }
}

module.exports = new VariableService();


