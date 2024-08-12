// services/ImprintInstitutionService.js
const ImprintInstitutionRepository = require('../repositories/ImprintInstitutionRepository');
const ImprintRepository = require('../repositories/ImprintRepository'); // Assuming you have a similar repository for Imprint

class ImprintInstitutionService {
    async create (payload) {
        try {
            return await ImprintInstitutionRepository.create(payload);
        } catch (error) {
            throw error;
        }
    }
    async getImprintsByInstitution(institutionId) {
        try {
            // Récupérer toutes les empreintes
            const imprints = await ImprintRepository.getAll(); // Adjust this if necessary

            // Récupérer les empreintes liées à l'institution spécifiée
            const imprintInstitutions = await ImprintInstitutionRepository.findByInstitutionId(institutionId);

            // Créer une map pour les empreintes de l'institution
            const imprintInstitutionMap = new Map();
            imprintInstitutions.forEach(imprintInst => {
                if (imprintInst.isAddedForAnInstitution) {
                    imprintInstitutionMap.set(imprintInst.imprintId.toString(), imprintInst);
                }
            });

            // Créer une map pour les empreintes non ajoutées pour l'institution
            const imprintNonInstitutionMap = new Map();
            imprintInstitutions.forEach(imprintInst => {
                if (!imprintInst.isAddedForAnInstitution) {
                    imprintNonInstitutionMap.set(imprintInst.imprintId.toString(), imprintInst);
                }
            });

            // Filtrer et préparer les résultats
            const result = await Promise.all(imprints.map(async (imprint) => {
                const imprintIdStr = imprint._id.toString();

                let imprintInstitution = null;

                if (imprintInstitutionMap.has(imprintIdStr)) {
                    // Prendre la dernière apparition pour l'institution spécifique
                    imprintInstitution = imprintInstitutionMap.get(imprintIdStr);
                } else if (imprintNonInstitutionMap.has(imprintIdStr)) {
                    // Prendre la dernière apparition des empreintes non ajoutées pour l'institution
                    imprintInstitution = imprintNonInstitutionMap.get(imprintIdStr);
                } else {
                    // Pour les empreintes non trouvées dans imprintInstitutions, prendre celles avec un statut actif
                    imprintInstitution = { imprintId: imprint._id, status: 'Able', institutionId, isAddedForAnInstitution: false };
                }

                // Ajouter le nom de l'empreinte au résultat
                return {
                    ...imprintInstitution,
                    name: imprint.name
                };
            }));

            // Filtrer les résultats nuls
            return result.filter(item => item !== null);

        } catch (error) {
            console.error('Error getting imprints by institution:', error);
            throw error;
        }
    }
}

module.exports = new ImprintInstitutionService();
