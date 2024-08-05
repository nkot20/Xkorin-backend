require('dotenv').config();
const mongoose = require('mongoose');
const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Question = require('../models/Question');
const Option = require('../models/Option');
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const VariableTranslation = require("../models/VariableTranslation");
const PropositionTranslation = require("../models/PropositionTranslation");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");
const Person = require("../models/Person");
const examRepository = require("../repositories/ExamRepository");
const subcategoryImprintRepository = require("../repositories/SubCategoryImprintRepository");
const {ObjectId} = require("mongodb");
const Helper = require("../common/Helper");
const fs = require("fs");
const { setCache, getCache, clearCache } = require('../common/cache');
const Examen = require("../models/Exam");
const Institution = require("../models/Institution");
const Company = require("../models/Company");
const ExamState = require('../models/ExamState');



class ImprintRepository {
    async createFootprint(datas) {
        try {
            return await Imprint.create(datas)
        } catch (error) {
            console.error("Erreur lors de la création de l'empreinte:", error);
            throw error;
        }
    }

    /**
     * Fonction pour récupérer les derniers fils sans fils pour chaque variable sans père et leurs traductions
     * @param orphanVariables
     * @param languageId
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async getLastChildrenForOrphans(orphanVariables, languageId) {
        try {
            // Fonction récursive pour trouver les derniers fils sans fils
            // Fonction récursive pour trouver les derniers fils sans fils
            const findLastChildrenWithoutChildren = async (variable) => {
                const children = await Variable.find({ parent: variable._id });
                if (children.length === 0) {
                    console.log("I want to see variable ", variable);
                    const translatedName = await getVariableTranslation(variable, languageId);
                    return [{
                        _id: variable._id,
                        name: translatedName,
                    }];
                }

                // Utiliser `Promise.all` pour éviter les boucles async
                const lastChildrenPromises = children.map(child => findLastChildrenWithoutChildren(child._id));
                const lastChildrenArrays = await Promise.all(lastChildrenPromises);
                return lastChildrenArrays.flat();
            };

            // Fonction pour récupérer la traduction d'une variable
            const getVariableTranslation = async (variable, languageId) => {
                console.log("I want to see the second variable ", variable);
                const translation = await VariableTranslation.findOne({
                    variableId: variable._id,
                    languageId
                });

                return translation ? translation.label : variable.name;
            };

            // Utiliser `Promise.all` pour exécuter les recherches en parallèle pour chaque variable sans père
            const responsePromises = orphanVariables.map(async (variable) => {
                const lastChildren = await findLastChildrenWithoutChildren(variable._id);
                const translatedName = await getVariableTranslation(variable, languageId);

                return {
                    _id: variable._id,
                    name: translatedName,
                    lastChildren
                };
            });

            // Retourner un tableau d'objets comme requis
            return await Promise.all(responsePromises);
        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while fetching the variables.');
        }
    }

    /**
     *
     * @param subcategoryId
     * @param isoCode (language)
     * @param profilId
     * @returns {Promise<*[]>}
     */
    async getVariablesForImprints(subcategoryId, isoCode, profilId) {
        try {
            // Trouver les imprintIds d'une sous catégorie
            let imprintIds = await subcategoryImprintRepository.getImprintIdBySubcategoryId(subcategoryId);

            // Trouver l'ID de la langue
            const language = await Language.findOne({ isoCode });
            if (!language) {
                throw new Error('Language not found');
            }
            const languageId = language._id;

            // Récupérer les empreintes
            let imprints = await Imprint.find({ _id: { $in: imprintIds } });


            let variablesWithImprints = [];

            await Promise.all(imprints.map(async (imprint) =>  {
                // Récupérer les variables sans parent pour les empreintes spécifiées
                const variables = await Variable.find({
                    imprintId: imprint._id,
                    parent: null
                });
                // ce tableau qui va contenir les variables et leur fils
                const variablesWithFirstChild = [];
                await Promise.all(variables.map(async (variable) => {
                    const firstsChild = await Variable.find({parent: ObjectId(variable._id)});
                    const orphanVariables = await this.getLastChildrenForOrphans(firstsChild, languageId);

                    variablesWithFirstChild.push({
                        variable,
                        children: orphanVariables
                    })
                }))

                // Fonction pour récupérer la traduction d'une question
                const getTranslatedQuestionForVariable = async (variableId) => {
                    const questions = await Question.find({ variableId, profilId });
                    let questionsTranslation = [];
                    await Promise.all(questions.map(async (question) => {
                        const questionTranslation = await QuestionTranslation.findOne({
                            questionId: question._id,
                            languageId: languageId
                        });
                        question.label = questionTranslation.label
                        questionsTranslation.push(question)

                    }) )



                    return questionsTranslation;
                };


                // Utiliser `Promise.all` pour traiter chaque orphelin en parallèle afin de trouver les variables fueilles de chaque variable racine
                const updatedOrphanVariables = await Promise.all(variablesWithFirstChild.map(async (variable) => {
                    // Utiliser `Promise.all` pour traiter chaque `lastChildren` en parallèle
                    const updatedLastChildren = await Promise.all(variable.children.map(async (child) => {
                        console.log(child)
                        const newChild = await Variable.findById(child._id);
                        const lastChildren = await Promise.all(child.lastChildren.map(async (child) => {
                            const questions = await getTranslatedQuestionForVariable(child._id);
                            return {
                                ...child,
                                questions
                            };
                        }))
                        child.lastChildren = lastChildren;
                        child.name = newChild.name;
                        return {
                            ...child
                        } ;

                    }));

                    variable.children = updatedLastChildren

                    return variable;
                }));

                variablesWithImprints.push({
                    imprint,
                    variables: updatedOrphanVariables,
                });
            }))
            variablesWithImprints = variablesWithImprints.sort((a,b) => {
                if (a.imprint.number > b.imprint.number)
                    return 1;
                else
                    return -1;
            })
            return variablesWithImprints;

        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while fetching the variables.');
        }
    }


    /**
     *
     * @param subcategoryId
     * @param isoCode (language)
     * @param profilId
     * @param examId
     * @returns {Promise<*[]>}
     */
    async getRemainingVariablesForImprints(subcategoryId, isoCode, profilId, examId) {
        try {
            // Find imprint IDs for the given subcategory
            let imprintIds = await subcategoryImprintRepository.getImprintIdBySubcategoryId(subcategoryId);

            // Find the language ID for the provided ISO code
            const language = await Language.findOne({ isoCode });
            if (!language) {
                throw new Error('Language not found');
            }
            const languageId = language._id;

            // Fetch imprints based on the retrieved IDs and sort them
            const imprints = await Imprint.find({ _id: { $in: imprintIds } }).sort({ number: 1 });

            let remainingVariablesWithImprints = [];

            await Promise.all(imprints.map(async (imprint) => {
                // Retrieve variables without a parent for the specified imprints
                const variables = await Variable.find({
                    imprintId: imprint._id,
                    parent: null
                });

                // Container for variables and their children
                const variablesWithFirstChild = [];
                await Promise.all(variables.map(async (variable) => {
                    const firstsChild = await Variable.find({ parent: variable._id });
                    const orphanVariables = await this.getLastChildrenForOrphans(firstsChild, languageId);

                    variablesWithFirstChild.push({
                        variable,
                        children: orphanVariables
                    });
                }));


                // Helper function to check if a variable has already been evaluated
                const isVariableEvaluated = async (variableId) => {
                    const examState = await ExamState.findOne({
                        variableId,
                        examId,
                    });
                    return !!examState; // Return true if evaluated, false otherwise
                };

                // Function to get translated questions for a variable
                const getTranslatedQuestionForVariable = async (variableId) => {
                    const questions = await Question.find({ variableId, profilId });
                    let questionsTranslation = [];
                    await Promise.all(questions.map(async (question) => {
                        const questionTranslation = await QuestionTranslation.findOne({
                            questionId: question._id,
                            languageId: languageId
                        });
                        if (questionTranslation) {
                            question.label = questionTranslation.label;
                            questionsTranslation.push(question);
                        }
                    }));

                    return questionsTranslation;
                };

                // Process each variable and its children to check for remaining variables
                const updatedOrphanVariables = await Promise.all(variablesWithFirstChild.map(async (variable) => {
                    const updatedChildren = await Promise.all(variable.children.map(async (child) => {
                        // Check if the current child variable has been evaluated
                        const isEvaluated = await isVariableEvaluated(child._id);

                        if (!isEvaluated) {
                            const lastChildren = await Promise.all(child.lastChildren.map(async (leaf) => {
                                const leafEvaluated = await isVariableEvaluated(leaf._id);

                                if (!leafEvaluated) {
                                    leaf.questions = await getTranslatedQuestionForVariable(leaf._id);
                                    return leaf;
                                } else {
                                    return null; // Skip this leaf if it has been evaluated
                                }
                            }));

                            const remainingLastChildren = lastChildren.filter(leaf => leaf !== null);

                            if (remainingLastChildren.length > 0) {
                                child.lastChildren = remainingLastChildren;
                                return child;
                            } else {
                                return null; // Skip this child if it has no remaining last children
                            }
                        } else {
                            return null; // Skip this child if it has been evaluated
                        }
                    }));

                    // Filter out evaluated children
                    const remainingChildren = updatedChildren.filter(child => child !== null);

                    // Return the variable if it still has remaining children
                    if (remainingChildren.length > 0) {
                        variable.children = remainingChildren;
                        return variable;
                    } else {
                        return null; // Skip this variable if it has no remaining children
                    }
                }));

                // Filter out variables with no remaining children
                const nonEmptyVariables = updatedOrphanVariables.filter(variable => variable !== null);

                if (nonEmptyVariables.length > 0) {
                    remainingVariablesWithImprints.push({
                        imprint,
                        variables: nonEmptyVariables.map(v => ({
                            variable: v.variable,
                            children: v.children
                        })),
                    });
                }
            }));

            return remainingVariablesWithImprints;
        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while fetching the remaining variables.');
        }
    }


    /**
     * check if exam has been completed
     * @param subcategoryId
     * @param examId
     * @returns {Promise<*[]>}
     */
    async isExamComplete(subcategoryId, examId) {
        try {
            // Obtenir toutes les imprintIds d'une sous-catégorie
            let imprintIds = await subcategoryImprintRepository.getImprintIdBySubcategoryId(subcategoryId);

            // Récupérer les empreintes
            const imprints = await Imprint.find({ _id: { $in: imprintIds } }).sort({ number: 1 });

            let allVariableIds = [];

            await Promise.all(imprints.map(async (imprint) => {
                // Récupérer les variables sans parent pour les empreintes spécifiées
                const variables = await Variable.find({
                    imprintId: imprint._id,
                    parent: null
                });

                await Promise.all(variables.map(async (variable) => {
                    const firstsChild = await Variable.find({ parent: ObjectId(variable._id) });
                    const orphanVariables = await this.getLastChildrenForOrphans(firstsChild, languageId);

                    orphanVariables.forEach(child => {
                        allVariableIds.push(child._id);
                    });
                }));
            }));

            // Obtenir les variables déjà répondues
            const answeredVariableIds = await ExamState.find({ examId }).distinct('variableId');

            // Vérifier si toutes les variables attendues sont présentes dans answeredVariableIds
            return allVariableIds.every(variableId => answeredVariableIds.includes(variableId.toString()));

        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while checking if the exam is complete.');
        }
    }


    /**
     *
     * @param footprintId
     * @param variableId
     * @returns {Promise<any>}
     */
    async addVariableToFootprint(footprintId, variableId) {

        try {
            console.log("variable", variableId)
            const footprint = await Imprint.findById(footprintId);

            // Vérifier si l'empreinte existe
            if (!footprint) {
                throw new Error("L'empreinte n'existe pas.");
            }

            // Ajouter l'ID de la variable à la liste des variables de l'empreinte
            let variables = [];
            if (!Array.isArray(footprint.variables)) {
                variables.push(variableId);
            } else {
                variables = footprint.variables;
                variables.push(variableId);
            }

            let newData = {
                name: footprint.name,
                variables: variables,
            }
            console.log(newData)


            // Enregistrer les modifications de l'empreinte
            return await Imprint.updateOne({_id: footprint._id}, newData, {new: true});
        } catch (error) {
            console.error("Erreur lors de l'ajout de la variable à l'empreinte:", error);
            throw error;
        }
    }

    async getAll() {
        try {
            return await Imprint.find();
        } catch (error) {
            throw error;
        }
    }


    /**
     * Fonction pour obtenir l'arbre de variables pour chaque empreinte
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async getFootprintVariableTree() {
        try {
            // Récupérer toutes les empreintes
            const imprints = await Imprint.find({});

            // Utiliser Promise.all pour exécuter les requêtes en parallèle
            return await Promise.all(imprints.map(async (fp) => {
                // Récupérer la racine de l'arbre de variables pour cette empreinte
                const rootVariables = await Variable.find({imprintId: fp._id, parent: null});

                // Fonction récursive pour construire l'arbre de variables
                let heightTree = 0;
                const buildVariableTree = async (parentId, imprintId) => {
                    const children = await Variable.find({imprintId: fp._id, parent: parentId});

                    if (children.length === 0) {
                        return [];
                    }

                    const tree = [];
                    // Utiliser Promise.all pour exécuter les itérations en parallèle
                    await Promise.all(children.map(async (child) => {
                        const subtree = await buildVariableTree(child._id, imprintId);

                        if (subtree.length === 0 && child.isFactor) {
                            tree.push({text: child.name, value: child._id + '-' + fp._id + '-leaf', children: subtree});

                        } else
                            tree.push({text: child.name, value: child._id + '-' + fp._id, children: subtree});
                    }));
                    return tree;
                };

                // Construire l'arbre de variables pour cette empreinte

                const tree = await buildVariableTree(null);

                // Retourner l'objet contenant l'empreinte et son arbre de variables
                return {text: fp.name, value: fp._id + '-' + 'imprint', children: tree};
            }));
        } catch (error) {
            console.error("Erreur lors de la récupération de l'arbre de variables:", error);
            throw error;
        }
    }

    /**
     *
     * @param examId
     * @returns {Promise<*[]>}
     */
    async buildVariableTree(examId){
        try {
            // Fetch all imprints at once
            const imprints = await Imprint.find().lean();

            // Map imprints to variable trees
            return await Promise.all(
               imprints.map((imprint) =>
                  imprintRepository.buildVariableTreeForImprint(imprint._id, examId).then(({isAvailable, variables}) => ({
                       imprint,
                       isAvailable,
                       variables,
                   }))
               )
           );
        } catch (error) {
            throw error;
        }
    }

    async buildVariableTreeForImprint(imprintId, examId) {
        try {
            const imprint = await Imprint.findById(imprintId);
            // Étape 1 : Récupérer toutes les variables associées à l'empreinte
            const variables = await Variable.find({ imprintId }).lean();
            const variableMap = new Map();

            // Créer une map pour un accès rapide par ID
            variables.forEach(variable => {
                variableMap.set(variable._id.toString(), {
                    ...variable,
                    children: [],
                    value: 0
                });
            });

            // Étape 2 : Construire la structure de l'arbre
            const rootVariables = [];
            variables.forEach(variable => {
                if (variable.parent) {
                    const parentVariable = variableMap.get(variable.parent.toString());
                    if (parentVariable) {
                        parentVariable.children.push(variableMap.get(variable._id.toString()));
                    }
                } else {
                    rootVariables.push(variableMap.get(variable._id.toString()));
                }
            });

            const profilId = await examRepository.getPersonProfileByExamId(examId)
            // Étape 3 : Récupérer toutes les questions et réponses en une seule requête
            const questions = await Question.find({ variableId: { $in: variables.map(v => v._id) }, weighting: false, profilId }).lean();
            const answers = await Answer.find({ questionId: { $in: questions.map(q => q._id) }, examId }).lean();

            // Créer une map pour les options par ID
            const options = await Option.find({ _id: { $in: answers.map(a => a.optionId) } }).lean();
            const optionMap = new Map(options.map(option => [option._id.toString(), option]));

            // Étape 4 : Calculer les valeurs des variables feuilles
            let countAnswer = 0;
            const leafVariables = variables.filter(variable => !variable.children.length);

            leafVariables.forEach(variable => {
                const variableQuestions = questions.filter(q => q.variableId.toString() === variable._id.toString());
                const variableAnswers = variableQuestions.map(q => answers.find(a => a.questionId.toString() === q._id.toString()));
                const values = variableAnswers.map(answer => {
                    if (answer) {
                        countAnswer++;
                        const option = optionMap.get(answer.optionId.toString());
                        return option ? option.value : 0;
                    }
                    return 0;
                });

                // Calcul de la valeur de la variable feuille
                variableMap.get(variable._id.toString()).value = Math.ceil(values.reduce((sum, val) => sum + val, 0) / values.length);
            });

            if (countAnswer === leafVariables.length) {
                console.log("Completed");
            }

            // Étape 5 : Calculer les valeurs des variables parentales
            function calculateParentValues(variable) {
                if (variable.children.length > 0) {
                    variable.children.forEach(calculateParentValues);

                    const totalValue = variable.children.reduce((sum, child) => sum + child.value, 0);
                    variable.value = Math.ceil(totalValue / variable.children.length);
                }
            }
            rootVariables.forEach(calculateParentValues);

            // Étape 6 : Construire le sous-arbre avec les variables racines et leurs feuilles
            function getRootWithFirstChildren(variable) {
                return {
                    ...variable,
                    children: variable.children
                };
            }
            const variablesResponse = rootVariables.map(getRootWithFirstChildren)
            // Retourner les variables racines avec uniquement leurs feuilles
            if (variablesResponse.length > 0) {
                Helper.exportDashboardExamAsPdf({
                    date: this.formatDate(new Date()),
                    dateExpiration: this.formatDate(this.addYearsToDate(new Date(), 1)),
                    imprintName: imprint.name + ' imprint',
                    variables: variablesResponse,
                    diamantlogo: this.imageFileToBase64('./public/logos/diamant_logo.jpg'),
                    imprintIsAvailable: ((countAnswer === leafVariables.length) && leafVariables.length > 0)
                }, examId, imprint.name).then(() => {
                })
            }


            return {
                isAvailable: ((countAnswer === leafVariables.length) && leafVariables.length > 0),
                variables: variablesResponse
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * calculate imprint for each exam
     * @param imprintId
     * @param examId
     * @returns {Promise<unknown>}
     */
    async calculateImprintValue(imprintId, examId) {
        const cacheKey = `${examId}_${imprintId}`;

        // Vérifier le cache
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Étape 1 : Récupérer toutes les variables associées à l'empreinte
        const variables = await Variable.find({ imprintId }).lean();

        const variableMap = new Map();
        variables.forEach(variable => {
            variableMap.set(variable._id.toString(), {
                ...variable,
                children: [],
                weight: variable.defaultWeight || 0,
                value: 0
            });
        });

        // Étape 3 : Récupérer les poids des variables feuilles
        const leafVariables = variables.filter(variable => variable.children.length === 0);

        // Récupérer toutes les questions pour les variables feuilles
        const questionIds = leafVariables.map(v => v._id);
        const questions = await Question.find({ variableId: { $in: questionIds } }).lean();

        // Récupérer toutes les réponses pour les questions du même examen
        const answerIds = questions.map(q => q._id);
        const answers = await Answer.find({ questionId: { $in: answerIds }, examId }).lean();

        // Récupérer toutes les options pour les réponses trouvées
        const optionIds = answers.map(a => a.optionId);
        const options = await Option.find({ _id: { $in: optionIds } }).lean();

        // Créer une map pour les options afin de les récupérer rapidement
        const optionMap = new Map(options.map(option => [option._id.toString(), option]));

        // Calculer le poids et la valeur de chaque variable feuille
        leafVariables.forEach(variable => {
            const variableQuestions = questions.filter(q => q.variableId.toString() === variable._id.toString());
            const variableAnswers = variableQuestions.map(q => answers.find(a => a.questionId.toString() === q._id.toString()));

            variableAnswers.forEach(answer => {
                if (answer) {
                    const option = optionMap.get(answer.optionId.toString());
                    if (option) {
                        if (questions.find(q => q._id.toString() === answer.questionId.toString()).weighting) {
                            variable.weight = option.value;
                        } else {
                            variable.value = option.value;
                        }
                    }
                }
            });
        });

        const totalWeight = leafVariables.reduce((sum, variable) => sum + variable.weight, 0);

        // Calculer le score final
        let score = Math.ceil((leafVariables.reduce((sum, variable) => sum + (variable.weight / totalWeight) * variable.value, 0) / 7) * 1216);
        if (isNaN(score)) score = 0;

        // Stocker les données calculées dans le cache
        await setCache(cacheKey, score);
        return score;
    }

    /**
     * get confidence index to the exam
     * @param examId
     * @returns {Promise<unknown>}
     */
    async getConfidenceIndex(examId){
        try {
            return new Promise(async (resolve, reject) => {
                const cacheKey = `${examId}_cci`;

                // Vérifier le cache
                const cachedData = await getCache(cacheKey);
                if (cachedData) {
                    return resolve(cachedData);
                } else {
                    // Si les données ne sont pas dans le cache, les calculer
                    const imprints = await Imprint.find();
                    let response = [];

                    await Promise.all(imprints.map(async (imprint) => {
                        this.calculateImprintValue(imprint.id, examId).then(value => {
                            response.push(value);
                        });

                    }));
                    const cci = response.reduce((sum, value) => sum + value, 0);
                    console.log("CCI ------------------------------------------------------------------", cci, examId)
                    resolve(cci);
                }
            });

        } catch (error) {
            throw error;
        }
    }

    /**
     *
     * @returns {Promise<{averageValue: number, minValue: number, maxValue: number, imprint: *}[]>}
     */
    async calculateImprintStatisticsForAllExams() {
        try {
            // Step 1: Retrieve all exams and imprints in parallel
            const [exams, imprints] = await Promise.all([
                Exam.find().lean(), // Use the real model for exams
                Imprint.find().lean() // Use the real model for imprints
            ]);

            // Sort imprints by number
            imprints.sort((a, b) => {
                if (a.number > b.number)
                    return -1;
                else
                    return 1;

            });

            // Dictionary to store the values of imprints for each exam
            const imprintValuesMap = new Map();

            // Step 3: Calculate the values of imprints for each exam
            await Promise.allSettled(
                exams.map(async (exam) => {
                    const examId = exam._id;

                    // Retrieve the values of the imprints for this exam
                    const imprintValues = await Promise.all(
                        imprints.map(async (imprint) => {
                            const value = await this.calculateImprintValue(imprint._id, examId);
                            return { imprint: imprint.name, value };
                        })
                    );

                    // Store the values of imprints for this exam
                    imprintValues.forEach(({ imprint, value }) => {
                        if (!imprintValuesMap.has(imprint)) {
                            imprintValuesMap.set(imprint, []);
                        }
                        imprintValuesMap.get(imprint).push(value);
                    });
                })
            );

            // Calculate statistics for each imprint
            const imprintStatistics = Array.from(imprintValuesMap.entries()).map(([imprint, values]) => {
                const validValues = values.filter(value => !isNaN(value));
                const minValue = Math.min(...validValues);
                const maxValue = Math.max(...validValues);
                const averageValue = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;

                return {
                    imprint,
                    minValue,
                    maxValue,
                    averageValue
                };
            });

            return imprintStatistics;
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques des empreintes pour tous les examens:', error);
            throw error;
        }
    }


    /**
     *
     * @param examId
     * @returns {Promise<*[]>}
     */
    async getValueToEachImprint(examId){
        try {
            let imprints = await Imprint.find();
            imprints = imprints.sort((a, b) => {
                if (a.number > b.number)
                    return 1;
                else
                    return -1;
            })
            console.log("Imprint sorted" ,imprints)
            let response = [];

            await Promise.all(imprints.map(async (imprint) => {
                const exam = await Exam.findById(examId);
                const person = await Person.findById(exam.personId);
                await this.calculateImprintValue(imprint.id, examId).then(value => {
                   /*  Helper.generateQrCode({
                        date: this.formatDate(new Date()),
                        nom: person.name,
                        formation: imprint.name + ' imprint',
                        score: value + '/1216'
                     }, person._id, examId, imprint.name);
                     Helper.exportWebsiteAsPdf({
                        date: this.formatDate(new Date()),
                        dateExpiration: this.formatDate(this.addYearsToDate(new Date(),1)),
                        lastname: person.name,
                        firstname: '',
                        formation: imprint.name + ' imprint',
                        points: value,
                        qrcode: this.imageFileToBase64('./public/qrcode/'+ imprint.name + '_' +examId+'_'+person._id+'.png'),
                        logoentetegauche: this.imageFileToBase64('./public/logos/accelerate-africa.jpg'),
                        logoentetedroit: this.imageFileToBase64('./public/logos/wellbin.PNG'),
                        diamantlogo: this.imageFileToBase64('./public/logos/diamant_logo.jpg'),
                        humanbetlogo: this.imageFileToBase64('./public/logos/humanbet_logo.jpg'),
                        mmlogo: this.imageFileToBase64('./public/logos/mm_logo.jpg'),
                        signature1: this.imageFileToBase64('./public/logos/signaturebossou.PNG'),
                        signature2: this.imageFileToBase64('./public/logos/signaturemondo.PNG'),
                    }, examId, imprint.name)*/

                    response.push({imprint, value});
                });

            })).then(async value => {
                //await Helper.combinePdfs("./public/certificats/imprints/"+examId, "./public/certificats/imprints-fusion/"+examId+".pdf")
            });
            response = response.sort((a, b) => {
                if (a.imprint.number > b.imprint.number)
                    return 1;
                else
                    return -1;
            })
            let imprintsValues = [];
            response.forEach(item => {
                imprintsValues.push(item.value)
            });
             return imprintsValues;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    /**
     *
     * @param examId
     * @returns {Promise<*[]>}
     */
    async printCertificate(examId){
        try {
            let imprints = await Imprint.find();
            imprints = imprints.sort((a, b) => {
                if (a.number > b.number)
                    return 1;
                else
                    return -1;
            })
            console.log("Imprint sorted" ,imprints)
            let response = [];

            await Promise.all(imprints.map(async (imprint) => {
                const exam = await Exam.findById(examId);
                const person = await Person.findById(exam.personId);
                await this.calculateImprintValue(imprint.id, examId).then(value => {
                    console.log('Imprint value ------------------------------- ' ,value)

                      Helper.exportCertificatExamAsPdf({
                         date: this.formatDate(new Date()),
                         dateExpiration: this.formatDate(this.addYearsToDate(new Date(),1)),
                         lastname: person.name,
                         firstname: '',
                         formation: imprint.name + ' imprint',
                         points: value,
                         qrcode: this.imageFileToBase64('./public/qrcode/'+ imprint.name + '_' +examId+'_'+person._id+'.png'),
                         logoentetegauche: this.imageFileToBase64('./public/logos/accelerate-africa.jpg'),
                         logoentetedroit: this.imageFileToBase64('./public/logos/wellbin.PNG'),
                         diamantlogo: this.imageFileToBase64('./public/logos/diamant_logo.jpg'),
                         humanbetlogo: this.imageFileToBase64('./public/logos/humanbet_logo.jpg'),
                         mmlogo: this.imageFileToBase64('./public/logos/mm_logo.jpg'),
                         signature1: this.imageFileToBase64('./public/logos/signaturebossou.PNG'),
                         signature2: this.imageFileToBase64('./public/logos/signaturemondo.PNG'),
                     }, examId, imprint.name, person._id)

                    response.push({imprint, value});
                });

            }));
            response = response.sort((a, b) => {
                if (a.imprint.number > b.imprint.number)
                    return 1;
                else
                    return -1;
            })
            let imprintsValues = [];
            response.forEach(item => {
                imprintsValues.push(item.value)
            });
            return imprintsValues;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    /**
     *
     * @param examId
     * @returns {Promise<this is *[]>}
     */
    async getAvailableExam(examId){
        try {
            const imprints = await Imprint.find();
            let response = [];

            await Promise.all(imprints.map(async (imprint) => {
                const {isAvailable} = await this.buildVariableTreeForImprint(imprint.id, examId);
                response.push(isAvailable);
            }));
            return response.every(value => value);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get index and imprints for all exam that we will allow to have graphic evolution
     * @param institutionId
     * @param personId
     * @returns {Promise<{examDetails: {exam: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, unknown, any>, institution: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, unknown, any>, person: Query<Document<unknown, any, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & Omit<InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>> & {_id: Types.ObjectId}, never> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TVirtuals"> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TInstanceMethods">, Document<unknown, any, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & Omit<InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>> & {_id: Types.ObjectId}, never> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TVirtuals"> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TInstanceMethods">, ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TQueryHelpers">, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TQueryHelpers">, company: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, unknown, any>}, imprintValue: *[], evolution: {indexValues: *[], imprintsData: *[]}, variableTree: *[]}>}
     */
    async getDatasForEachExam(institutionId, personId) {
        try {
            const exams = await examRepository.getExamsByPersonAndInstitution(personId, institutionId);
            console.log(exams)
            const evolution = [];
            const indexValues = [];
            let imprintsData = [];
            await Promise.all(exams.map(async (value) => {
                let imprints = await this.getValueToEachImprint(value._id);
                const cii = imprints.reduce((sum, value) => sum + value, 0);
                indexValues.push({date: this.formatDate(value.createdAt), value: cii})
                evolution.push({imprints, date: this.formatDate(value.createdAt)})
            }));
            let i = 0;
            evolution.forEach(item => {
                item.imprints.forEach((imprint, index) => {
                    if (!imprintsData[index]) {
                        imprintsData[index] = [];
                    }
                    imprintsData[index].push({date: item.date, value: imprint});
                });


            })

            const latestExam = await examRepository.getLatestExamByPersonAndInstitution(personId, institutionId);
            const examDetails = await examRepository.getExamById(latestExam._id);
            const imprintValue = await this.getValueToEachImprint(latestExam._id);
            const variableTree = await this.buildVariableTree(latestExam._id);
            return {examDetails, evolution: {indexValues, imprintsData}, imprintValue, variableTree};
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getFiles(examId) {
        try {
            await this.printCertificate(examId).then(async (value) => {
                return await Helper.combinePdfs("public/certificats/imprints/"+examId, "public/dashboard/"+examId, "public/certificats/imprints-fusion/"+examId+".pdf")
            });

        } catch (error) {
            throw error;
        }
    }


    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    addYearsToDate(date, yearsToAdd) {
        const newDate = new Date(date); // Crée une copie de la date d'origine
        newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Ajoute le nombre d'années spécifié
        return newDate;
    }

    imageFileToBase64(filePath) {
        try {
            // Lire le fichier image depuis le chemin relatif
            const imageData = fs.readFileSync(filePath);

            // Convertir les données en base64
            return Buffer.from(imageData).toString('base64');
        } catch (error) {
            console.error('Erreur lors de la conversion de l\'image en base64 :', error.message);
            return null;
        }
    }
}



const imprintRepository = new ImprintRepository();
module.exports = imprintRepository;


