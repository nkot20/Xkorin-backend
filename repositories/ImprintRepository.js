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
        try {

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
                const questions = await Question.find({ variableId: variable._id, weighting: true }).lean();
                const weights = await Promise.all(questions.map(async question => {
                    if (question.weighting) {
                        const answer = await Answer.findOne({ questionId: question._id, examId }).lean();
                        if (answer) {
                            const option = await Option.findById(answer.optionId).lean();
                            return option.value;
                        } else {
                            return 0;
                        }
                    }
                }));
                variable.weight = weights[0];
            }));


            // Étape 5 : Récupérer les valeurs des variables feuilles
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

            const totalWeight = leafVariables.reduce((sum, variable) => sum + variable.weight, 0);

            // Retourner l'arbre des variables
             return Math.ceil((leafVariables.reduce((sum, variable) => sum + (variable.weight / totalWeight) * variable.value, 0) / 7) * 1216);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getConfidenceIndex(examId){
        try {
            const imprints = await Imprint.find();
            let response = [];

            await Promise.all(imprints.map(async (imprint) => {
                const value = await this.calulateImprintValue(imprint.id, examId);
                response.push(value);
            }));
            return response.reduce((sum, value) => sum + value, 0);
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
            console.log(imprints)
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
            const imprints = await Imprint.find();
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
                    }, examId, imprint.name).then(value => {

                    })

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