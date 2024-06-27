require('dotenv').config();
const mongoose = require('mongoose');
const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Factor = require('../models/Factor');
const Question = require('../models/Question');
const Proposition = require('../models/Proposition');
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const VariableTranslation = require("../models/VariableTranslation");
const PropositionTranslation = require("../models/PropositionTranslation");
const subcategoryImprintRepository = require("../repositories/SubCategoryImprintRepository");
const {ObjectId} = require("mongodb");




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
            const findLastChildrenWithoutChildren = async (variableId) => {
                const children = await Variable.find({ parent: variableId });
                if (children.length === 0) {
                    const variable = await Variable.findById(variableId);
                    const translatedName = await getVariableTranslation(variableId, languageId);
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
            const getVariableTranslation = async (variableId, languageId) => {
                const translation = await VariableTranslation.findOne({
                    variableId,
                    languageId
                });
                return translation ? translation.label : null;
            };

            // Utiliser `Promise.all` pour exécuter les recherches en parallèle pour chaque variable sans père
            const responsePromises = orphanVariables.map(async (variable) => {
                const lastChildren = await findLastChildrenWithoutChildren(variable._id);
                const translatedName = await getVariableTranslation(variable._id, languageId);

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
                    console.log(variable)
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



}

const imprintRepository = new ImprintRepository();
module.exports = imprintRepository;