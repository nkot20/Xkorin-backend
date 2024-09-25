require('dotenv').config();
const mongoose = require('mongoose');
const institutionService = require("../services/InstitutionService");
const programRepository = require("../repositories/ProgramRepository");
const INSTITUTIONNAME = require("../config/institution");
const Program = require("../models/Program");
const Institution = require("../models/Institution");
const programImprintService = require("../services/ProgramImprintService");
const {ObjectId} = require("mongodb");

class ProgramService {
    async create(payload) {
        try {
            const program = await programRepository.findOneByName(payload.name);

            if (payload.targetInstitutionId === "Nothing") {
                const institution = await institutionService.getInstitutionByName(INSTITUTIONNAME.NAME);
                payload.targetInstitutionId = institution._id;
            }

            if (program) {
                throw new Error('Program already exists');
            }
            const newProgram = await programRepository.save(payload);
            await Promise.all(payload.imprintIds.map(async (imprintId) => {
                return await programImprintService.create({imprintId, programId: newProgram._id})
            }))
        } catch (error) {
            throw error;
        }
    }

    async update(id, payload) {
        try {
            return await programRepository.updateOne(id, payload);
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            return await programRepository.find();
        } catch (error) {
            throw error;
        }
    }

    async getByName(name) {
        try {
            return await programRepository.findOneByName(name);
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            return await programRepository.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async listProgramsByInstitutionWithoutPagination(institutionId) {
        try {
            return await programRepository.findByInstitutionWithoutPagination(institutionId);
        } catch (error) {
            throw error;
        }
    }

    async listProgramsByInstitution(institutionId, options) {
        try {
            const searchRegex = new RegExp(options.search, 'i');

            // Calcul du nombre de documents à sauter pour la pagination
            const skip = (options.page - 1) * options.limit;

            // Rechercher les programmes par institutionId et nom avec pagination et tri
            const programs = await Program.find({
                institutionId: new ObjectId(institutionId),
                $or: [
                    { name: { $regex: searchRegex } },
                    { targetName: { $regex: searchRegex } }
                ]
            })
                .select('code name archived createdAt updatedAt targetInstitutionId numberOfParticipants amount')
                .sort({ [options.sortBy]: options.sortDirection }) // Tri selon les options
                .skip(skip) // Sauter les documents pour la pagination
                .limit(options.limit); // Limiter les résultats

            // Si des programmes sont trouvés, récupérer les informations des institutions cibles
            const institutionIds = programs.map(program => program.targetInstitutionId).filter(id => id);

            // Rechercher les institutions correspondantes
            const institutions = await Institution.find({ _id: { $in: institutionIds } })
                .select('name _id');

            // Associer les données des institutions aux programmes
            const programsWithInstitutionData = programs.map(program => {
                const targetInstitution = institutions.find(inst => inst._id.equals(program.targetInstitutionId));
                return {
                    ...program._doc,
                    targetInstitution: targetInstitution ? { _id: targetInstitution._id, name: targetInstitution.name } : null
                };
            });

            // Calculer le total des programmes pour la pagination
            const totalPrograms = await Program.countDocuments({
                institutionId: new ObjectId(institutionId),
                $or: [
                    { name: { $regex: searchRegex } },
                    { targetName: { $regex: searchRegex } }
                ]
            });

            // Calculer le nombre total de pages
            const totalPages = Math.ceil(totalPrograms / options.limit);

            // Déterminer si une page suivante ou précédente existe
            const hasNextPage = options.page < totalPages;
            const hasPrevPage = options.page > 1;

            // Déterminer les pages suivantes et précédentes
            const nextPage = hasNextPage ? options.page + 1 : null;
            const prevPage = hasPrevPage ? options.page - 1 : null;

            // Retourner les résultats avec pagination
            return {
                programs: programsWithInstitutionData,
                pagination: {
                    hasNextPage,
                    hasPrevPage,
                    limit: options.limit,
                    nextPage,
                    page: options.page, // Page actuelle
                    pagingCounter: skip + 1, // Compteur de pagination
                    prevPage,
                    totalDocs: totalPrograms, // Nombre total de documents
                    totalPages
                }
            };
        } catch (error) {
            console.error('Error listing programs:', error);
            throw error;
        }
    }

    async getDetails(programId, options) {
        try {
            return await programImprintService.getParticipantsAndCompaniesByProgram(programId, options);
        } catch (error) {
            throw error;
        }
    }

    async archivedProgram(id) {
        try {
            return await programRepository.archiveProgram(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProgramService();
