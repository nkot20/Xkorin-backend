const Program = require('../models/Program');
require('dotenv').config();
const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
const INSTITUTIONNAME = require("../config/institution");
const institutionRepository = require("../repositories/InstitutionRepository");
const Company = require("../models/Company");

class ProgramRepository {

    async create(payload) {
        try {
            const program =  await Program.findOne({name: payload.name});
            if (payload.targetInstitutionId === "nothing") {
                const institution = await institutionRepository.getByName(INSTITUTIONNAME.NAME);
                payload.targetInstitutionId = institution._id;
            }

            if (program)
                throw new Error('Program is already exist');
            const newProgram = new Program(payload);
            return await newProgram.save();
        } catch (error) {
            throw error;
        }
    }

    async update(id, payload) {
        try {
            return await Program.updateOne({_id: id}, payload);
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            return await Program.find();
        } catch (error) {
            throw error;
        }
    }

    async getByName(name) {
        try {
            return await Program.findOne({name});
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            return await Program.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async listProgramsByInstitutionWithoutPagination(institutionId) {
        try {
            return await Program.find({institutionId});
        } catch (error) {
            throw error;
        }
    }

    async listProgramsByInstitution(institutionId, options) {
        try {
            const aggregate = Program.aggregate([
                {
                    $match: { institutionId: mongoose.Types.ObjectId(institutionId) }
                },
                {
                    $lookup: {
                        from: 'institutions', // Name of the target collection
                        localField: 'targetInstitutionId',
                        foreignField: '_id',
                        as: 'targetInstitution'
                    }
                },
                {
                    $unwind: {
                        path: '$targetInstitution',
                        preserveNullAndEmptyArrays: true // To include programs without a target institution
                    }
                },
                {
                    $project: {
                        name: 1,
                        archived: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        targetName: '$targetInstitution.name' // Rename targetInstitution.name to targetName
                    }
                }
            ]);

            const searchRegex = new RegExp(options.search, 'i');
            aggregate.append({
                $match: {
                    $or: [
                        { name: { $regex: searchRegex } },
                        { targetName: { $regex: searchRegex } },
                    ],
                },
            });

            return await Program.aggregatePaginate(aggregate, options);
        } catch (error) {
            console.error('Error listing programs:', error);
            throw error;
        }
    }

    // archived program
    async archivedProgram(id) {
        try {
            return await Program.updateOne({_id: id}, {archived: true});
        } catch (error) {
            throw error;
        }
    }
}

const programRepository = new ProgramRepository();
module.exports = programRepository;

