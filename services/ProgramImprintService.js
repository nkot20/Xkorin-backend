const programImprintRepository = require('../repositories/ProgramImprintRepository');
const Exam = require('../models/Exam');
const Person = require('../models/Person');
const Company = require('../models/Company');
class ProgramImprintService {
    async create(payload) {
        try {
            return await programImprintRepository.create(payload)
        } catch (error) {
            throw error;
        }
    }

    async getParticipantsAndCompaniesByProgram(programId, options) {
        try {
            const searchRegex = new RegExp(options.search, 'i'); // Pour rechercher les noms des participants si nécessaire

            // Calcul du nombre de documents à sauter pour la pagination
            const skip = (options.page - 1) * options.limit;

            // Étape 1: Trouver tous les examens liés au programme avec pagination
            const exams = await Exam.find({
                programId,
                $or: [
                    { 'person.name': { $regex: searchRegex } } // Si vous voulez filtrer par nom de participant
                ]
            })
                .select('personId')
                .skip(skip) // Sauter les documents pour la pagination
                .limit(options.limit) // Limiter les résultats
                .lean();
            console.log(exams , '+++++++++++++++++++++++++++++++')
            // Étape 2: Extraire les IDs des personnes
            const personIds = exams.map(exam => exam.personId);

            // Étape 3: Récupérer les détails des personnes
            const participants = await Person.find({ _id: { $in: personIds } }).lean();

            // Étape 4: Pour chaque participant, récupérer les informations de son entreprise
            const participantsWithCompany = await Promise.all(
                participants.map(async (participant) => {
                    const company = await Company.findOne({ _id: { $in: participant.company_id } }).lean();
                    return {
                        participant,
                        company
                    };
                })
            );
            console.log(participantsWithCompany)
            // Étape 5: Calculer le nombre total de participants (pour la pagination)
            const totalParticipants = await Exam.countDocuments({
                programId,
                $or: [
                    { 'person.name': { $regex: searchRegex } } // Filtrage par nom de participant si nécessaire
                ]
            });

            // Étape 6: Calculer le nombre total de pages
            const totalPages = Math.ceil(totalParticipants / options.limit);

            // Déterminer si une page suivante ou précédente existe
            const hasNextPage = options.page < totalPages;
            const hasPrevPage = options.page > 1;

            // Déterminer les pages suivantes et précédentes
            const nextPage = hasNextPage ? options.page + 1 : null;
            const prevPage = hasPrevPage ? options.page - 1 : null;

            // Étape 7: Retourner les résultats avec pagination
            return {
                participantsWithCompany,
                pagination: {
                    hasNextPage,
                    hasPrevPage,
                    limit: options.limit,
                    nextPage,
                    page: options.page, // Page actuelle
                    pagingCounter: skip + 1, // Compteur de pagination
                    prevPage,
                    totalDocs: totalParticipants, // Nombre total de documents
                    totalPages
                }
            };
        } catch (error) {
            console.error('Error fetching participants and companies:', error);
            throw error;
        }
    }

}

const programImprintService = new ProgramImprintService();
module.exports = programImprintService;