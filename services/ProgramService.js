require('dotenv').config();
const mongoose = require('mongoose');
const institutionService = require("../services/InstitutionService");
const programRepository = require("../repositories/ProgramRepository");
const INSTITUTIONNAME = require("../config/institution");
const Program = require("../models/Program");

class ProgramService {
    async create(payload) {
        try {
            const program = await programRepository.findOneByName(payload.name);

            if (payload.targetInstitutionId === "nothing") {
                const institution = await institutionService.getInstitutionByName(INSTITUTIONNAME.NAME);
                payload.targetInstitutionId = institution._id;
            }

            if (program) {
                throw new Error('Program already exists');
            }
            return await programRepository.save(payload);
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
            const aggregatePipeline = [
                {
                    $match: { institutionId: mongoose.Types.ObjectId(institutionId) }
                },
                {
                    $lookup: {
                        from: 'institutions',
                        localField: 'targetInstitutionId',
                        foreignField: '_id',
                        as: 'targetInstitution'
                    }
                },
                {
                    $unwind: {
                        path: '$targetInstitution',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        name: 1,
                        archived: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        targetName: '$targetInstitution.name'
                    }
                }
            ];

            const searchRegex = new RegExp(options.search, 'i');
            aggregatePipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: searchRegex } },
                        { targetName: { $regex: searchRegex } },
                    ],
                },
            });

            return await programRepository.aggregatePaginate(aggregatePipeline, options);
        } catch (error) {
            console.error('Error listing programs:', error);
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
