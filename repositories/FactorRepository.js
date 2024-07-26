/*
require('dotenv').config();

const Footprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Factor = require('../models/Factor');
const Weight = require('../models/Weight');

class FactorRepository {
    async create(factor) {
        try {
            return await Factor.create(factor);
        } catch (error) {
            console.error("Erreur lors de l'ajout du facteur:", error);
            throw error;
        }
    }

    async delete(factorId) {
        try {
            return await Factor.deleteOne(factorId);
        } catch (error) {
            console.error("Erreur lors de la suppression du facteur:", error);
            throw error;
        }
    }

    async getListeFacteursAvecPoids() {
        try {
            // Récupérer tous les facteurs
            const facteurs = await Factor.find().lean();

            // Initialiser un objet pour stocker le dernier poids de chaque facteur
            const dernierPoidsFacteurs = {};

            // Récupérer le dernier poids attribué à chaque facteur par une compagnie, ou le poids par défaut s'il n'y a aucun poids attribué
            await Promise.all(facteurs.map(async (facteur) => {
                // Récupérer le dernier poids attribué au facteur par une compagnie
                const dernierPoids = await Weight.findOne({ factorId: facteur._id }).sort({ createdAt: -1 }).lean();

                // Si aucun poids n'est trouvé, utiliser le poids par défaut du facteur
                const poids = dernierPoids ? dernierPoids.value : facteur.dafaultWeight;

                // Stocker le poids dans l'objet des derniers poids des facteurs
                dernierPoidsFacteurs[facteur._id] = poids;
            }));
            // Ajouter le dernier poids à chaque facteur
            const facteursAvecPoids = facteurs.map(facteur => ({
                ...facteur,
                dernierPoids: dernierPoidsFacteurs[facteur._id] // Ajouter le dernier poids ou le poids par défaut à chaque facteur
            }));
            console.log(facteursAvecPoids)

            return facteursAvecPoids;
        } catch (error) {
            console.error("Une erreur est survenue lors de la récupération de la liste des facteurs avec leurs poids:", error);
            throw error;
        }
    }

    async addWeight (datas){
        try {
            return await Weight.create(datas)
        } catch (error) {
           throw error;
        }
    }

}

const factorRepository = new FactorRepository();
module.exports = factorRepository;*/
