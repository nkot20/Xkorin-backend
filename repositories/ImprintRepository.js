require('dotenv').config();
const mongoose = require('mongoose');
const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Factor = require('../models/Factor');
const Question = require('../models/Question');
const Option = require('../models/Option');
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const VariableTranslation = require("../models/VariableTranslation");
const PropositionTranslation = require("../models/PropositionTranslation");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");
const Person = require("../models/Person");
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

    // Fonction pour récupérer les derniers fils sans fils pour chaque variable sans père et leurs traductions
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

    async getVariablesForImprints(subcategoryId, isoCode, profilId) {
        try {
            // Trouver les imprintIds d'une sous catégorie
            let imprintIds = await subcategoryImprintRepository.getImprintIdBySubcategoryId(subcategoryId);
            //imprintIds = ['6637a43d72e10eed26cd7d62']
            // Trouver l'ID de la langue
            const language = await Language.findOne({ isoCode });
            if (!language) {
                throw new Error('Language not found');
            }
            const languageId = language._id;

            // Récupérer les empreintes
            const imprints = await Imprint.find({ _id: { $in: imprintIds } }).sort({ number: 1 });

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

            return variablesWithImprints;

        } catch (error) {
            console.error(error);
            throw new Error('An error occurred while fetching the variables.');
        }
    }


<<<<<<< Updated upstream
=======

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
     * @returns {Promise<awaited Query<UpdateResult, module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? DocType : unknown extends Document ? Require_id<module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? DocType : unknown> : (Document<unknown, any, module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? DocType : unknown> & MergeType<Require_id<module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? DocType : unknown>, module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? TVirtuals : unknown & module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? TInstanceMethods : unknown>), module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? TQueryHelpers : unknown, module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? DocType : unknown> & module:mongoose.Schema<any, Model<EnforcedDocType, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, ApplySchemaOptions<ObtainDocumentType<any, EnforcedDocType, TSchemaOptions>, TSchemaOptions>> extends Schema<infer EnforcedDocType, infer M, infer TInstanceMethods, infer TQueryHelpers, infer TVirtuals, infer TStaticMethods, infer TSchemaOptions, infer DocType> ? TQueryHelpers : unknown>}
     */
>>>>>>> Stashed changes
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


    // Fonction pour obtenir l'arbre de variables pour chaque empreinte
    async getFootprintVariableTree() {
        try {
            // Récupérer toutes les empreintes
            const imprints = await Imprint.find({});

            // Utiliser Promise.all pour exécuter les requêtes en parallèle
            const imprintVariableTree = await Promise.all(imprints.map(async (fp) => {
                // Récupérer la racine de l'arbre de variables pour cette empreinte
                const rootVariables = await Variable.find({ imprintId: fp._id, parent: null });

                // Fonction récursive pour construire l'arbre de variables
                let heightTree = 0;
                const buildVariableTree = async (parentId, imprintId) => {
                    const children = await Variable.find({ imprintId: fp._id, parent: parentId });

                    if (children.length === 0) {
                        return [];
                    }

                    const tree = [];
                    // Utiliser Promise.all pour exécuter les itérations en parallèle
                    await Promise.all(children.map(async (child) => {
                        const subtree = await buildVariableTree(child._id, imprintId);

                        if (subtree.length === 0 && child.isFactor) {
                            tree.push({ text: child.name, value: child._id+'-'+fp._id+'-leaf', children: subtree });

                        } else
                            tree.push({ text: child.name, value: child._id+'-'+fp._id, children: subtree });
                    }));
                    return tree;
                };

                // Construire l'arbre de variables pour cette empreinte

                const tree = await buildVariableTree(null);

                // Retourner l'objet contenant l'empreinte et son arbre de variables
                return {text: fp.name, value: fp._id+'-'+'imprint', children: tree};
            }));

            return imprintVariableTree;
        } catch (error) {
            console.error("Erreur lors de la récupération de l'arbre de variables:", error);
            throw error;
        }
    }

    async buildVariableTree(examId){
        try {
           const imprints = await Imprint.find();
           let response = [];

           await Promise.all(imprints.map(async (imprint) => {
               const {isAvailable, variables} = await this.buildVariableTreeForImprint(imprint.id, examId);
               response.push({imprint, isAvailable, variables});
           }));
           return response;
        } catch (error) {
            throw error;
        }
    }

    async buildVariableTreeForImprint(imprintId, examId) {
        try {
            // Étape 1 : Récupérer toutes les variables associées à l'empreinte
            const variables = await Variable.find({ imprintId }).lean();
            const variableMap = {};
            variables.forEach(variable => {
                variableMap[variable._id] = {
                    ...variable,
                    children: [],
                    value: 0
                };
            });

            // Étape 2 : Construire la structure de l'arbre
            let rootVariables = [];
            variables.forEach(variable => {
                if (variable.parent) {
                    if (variableMap[variable.parent]) {
                        variableMap[variable.parent].children.push(variableMap[variable._id]);
                    }
                } else {
                    rootVariables.push(variableMap[variable._id]);
                }
            });

            // Étape 3 : Calculer les valeurs des variables feuilles
            const leafVariables = Object.values(variableMap).filter(variable => variable.children.length === 0);

            // Étape 4 : Calculer les valeurs des variables feuilles
            let countAnswer = 0;
            await Promise.all(leafVariables.map(async variable => {
                const questions = await Question.find({ variableId: variable._id, weighting: false }).lean();
                const values = await Promise.all(questions.map(async question => {
                    if (!question.weighting) {
                        const answer = await Answer.findOne({ questionId: question._id, examId }).lean();
                        if (answer) {
                            countAnswer ++;
                            const option = await Option.findById(answer.optionId).lean();
                            return option.value;
                        } else {
                            return 0;
                        }


                    }
                }));
                variable.value = values[0];
            }));

            if (countAnswer === leafVariables.length)
                console.log("Completed")

            // Étape 5 : Calculer les valeurs des variables parentales
            async function calculateParentValues(variable) {
                if (variable.children.length > 0) {
                    await Promise.all(variable.children.map(calculateParentValues));

                    const totalValue = variable.children.reduce((sum, child) => sum + (child.value), 0);
                    variable.value = Math.ceil(totalValue / variable.children.length);
                }
            }
            await Promise.all(rootVariables.map(calculateParentValues));

            // Étape 6 : Construire le sous-arbre avec les variables racines et leurs feuilles
            // Étape 6 : Construire le sous-arbre avec les variables racines et leurs premiers fils
            function getRootWithFirstChildren(variable) {
                return {
                    ...variable,
                    children: variable.children
                };
            }

            // Retourner les variables racines avec uniquement leurs feuilles

            return {isAvailable: ((countAnswer === leafVariables.length) && leafVariables.length > 0), variables: rootVariables.map(getRootWithFirstChildren)};
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

     async calulateImprintValue(imprintId, examId) {
        //await clearCache();
        return new Promise(async (resolve, reject) => {
            const cacheKey = `${examId}_${imprintId}`;

            // Vérifier le cache
            const cachedData = await getCache(cacheKey);
            if (cachedData) {
                return resolve(cachedData);
            } else {
                // Si les données ne sont pas dans le cache, les calculer
                // Étape 1 : Récupérer toutes les variables associées à l'empreinte
                const variables = await Variable.find({ imprintId }).lean();
                const variableMap = {};
                variables.forEach(variable => {
                    variableMap[variable._id] = {
                        ...variable,
                        children: [],
                        weight: variable.dafaultWeight || 0,
                        value: 0
                    };
                });


                // Étape 3 : récupérer les poids des variables feuilles
                const leafVariables = variables.filter(variable => variable.children.length === 0);
                await Promise.all(leafVariables.map(async variable => {
                    const questions = await Question.find({ variableId: variable._id}).lean();
                    await Promise.all(questions.map(async question => {
                        const answer = await Answer.findOne({ questionId: question._id, examId }).lean();
                        if (answer) {
                            const option = await Option.findById(answer.optionId).lean();

                            if (question.weighting) {
                                variable.weight = option.value;
                            } else {
                                variable.value = option.value;
                            }
                        }
                    }));
                }));


                /* // Étape 5 : Récupérer les valeurs des variables feuilles
                 await Promise.all(leafVariables.map(async variable => {
                     const questions = await Question.find({ variableId: variable._id, weighting: false }).lean();
                     const values = await Promise.all(questions.map(async question => {
                         if (!question.weighting) {
                             const answer = await Answer.findOne({ questionId: question._id, examId }).lean();
                             if (answer) {
                                 const option = await Option.findById(answer.optionId).lean();
                                 return option.value;
                             } else {
                                 return 0;
                             }
                         }
                     }));
                     variable.value = values[0];
                 }));


*/

                const totalWeight = leafVariables.reduce((sum, variable) => sum + variable.weight, 0);

                // Retourner l'arbre des variables
                let score = Math.ceil((leafVariables.reduce((sum, variable) => sum + (variable.weight / totalWeight) * variable.value, 0) / 7) * 1216);
                if (isNaN(score))
                    score = 0;

                // Stocker les données calculées dans le cache
                await setCache(cacheKey, score);
                const cachedData2 = await getCache(cacheKey);
                console.log("cache datas 2 ------------------------------------------------------------------------------------------- ", cacheKey, cachedData2, score);
                return resolve(score);
            }
        });

    }

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
                        this.calulateImprintValue(imprint.id, examId).then(value => {
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

    async calculateImprintStatisticsForAllExams() {
        try {
            // Étape 1 : Récupérer tous les examens
            const exams = await Exam.find().lean(); // Changez 'Exam' par votre modèle réel pour les examens

            // Étape 2 : Récupérer toutes les empreintes
            let imprints = await Imprint.find().lean(); // Changez 'Imprint' par votre modèle réel pour les empreintes
            imprints = imprints.sort((a, b) =>{
                if ( a.number < b.number)
                    return -1;
                else
                    return 1;
            });
            // Dictionnaire pour stocker les valeurs des empreintes pour chaque examen
            const imprintValuesMap = {};

            // Étape 3 : Calculer les valeurs des empreintes pour chaque examen
            await Promise.all(exams.map(async exam => {
                const examId = exam._id;

                // Récupérer les valeurs des empreintes pour cet examen
                const imprintValues = await Promise.all(imprints.map(async imprint => {
                    const value = await this.calulateImprintValue(imprint._id, examId);
                    return { imprint: imprint.name, value };
                }));

                // Stocker les valeurs des empreintes pour cet examen
                imprintValues.forEach(({ imprint, value }) => {
                    if (!imprintValuesMap[imprint]) {
                        imprintValuesMap[imprint] = [];
                    }
                    imprintValuesMap[imprint].push(value);
                });
            }));

            const imprintStatistics = Object.entries(imprintValuesMap).map(([imprint, values]) => {
                const validValues = values.map(value => isNaN(value) ? 0 : value);
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

    async getValueToEachImprint(examId){
        try {
            let imprints = await Imprint.find();
            imprints = imprints.sort((a, b) => {
                if (a.number > b.number)
                    return -1;
                else
                    return 1;
            })
            let response = [];

            await Promise.all(imprints.map(async (imprint) => {
                const exam = await Exam.findById(examId);
                const person = await Person.findById(exam.personId);
                await this.calulateImprintValue(imprint.id, examId).then(value => {
                     console.log("imprint value " + imprint.name + ' ', value);
                     Helper.generateQrCode({
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
                    }, examId, imprint.name)

                    response.push(value);
                });

            })).then(async value => {
                await Helper.combinePdfs("./public/certificats/imprints/"+examId, "./public/certificats/imprints-fusion/"+examId+".pdf")
            });
             return response;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

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

    /*
        Get index and imprints for all exam that we will allow to have graphic evolution
        @param institutionId,
        @param personId
     */
    async getDatasForEachExam(institutionId, personId) {
        try {
            const exams = await Exam.find({personId, institutionId});
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

            const latestExam = await Exam.findOne({ personId, institutionId })
                .sort({ createdAt: -1 });
            console.log(latestExam)
            const examDetails = await this.getExamById(latestExam._id);
            const imprintValue = await this.getValueToEachImprint(latestExam._id);
            const variableTree = await this.buildVariableTree(latestExam._id);
            return {examDetails, evolution: {indexValues, imprintsData}, imprintValue, variableTree};
        } catch (error) {
            throw error;
        }
    }

    async getExamById(id) {
        try {
            const exam = await Examen.findById(id);
            const person = await Person.findById(exam.personId);
            const institution = await Institution.findById(exam.institutionId);
            const company = await Company.findById(person.company_id[0]);
            return {exam, person, company, institution}
        } catch (error) {
            console.error(error)
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


