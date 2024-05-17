require('dotenv').config();

const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Factor = require('../models/Factor');



class ImprintRepository {
    async createFootprint(datas) {
        try {
            return await Imprint.create(datas)
        } catch (error) {
            console.error("Erreur lors de la création de l'empreinte:", error);
            throw error;
        }
    }

    async removeFootprint(footprintId) {
        try {
            // Trouver l'empreinte
            const footprint = await Imprint.findById(footprintId);

            // Supprimer toutes les variables de cette empreinte
            const variables = await Variable.find({ _id: { $in: footprint.variables } });

            // Créer un tableau de promesses pour supprimer tous les facteurs de chaque variable
            const factorDeletionPromises = variables.map(variable => {
                return Factor.deleteMany({ _id: { $in: variable.factors } });
            });

            // Attendre que toutes les promesses de suppression des facteurs soient résolues
            await Promise.all(factorDeletionPromises);

            // Supprimer l'empreinte elle-même
            await Imprint.findByIdAndDelete(footprintId);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'empreinte:", error);
            throw error;
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