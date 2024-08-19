const Program = require('../models/Program');
const mongoose = require('mongoose');
const Exam = require("../models/Exam");

class ProgramRepository {
    async findOneByName(name) {
        try {
            return await Program.findOne({ name });
        } catch (error) {
            throw error;
        }
    }

    async save(program) {
        try {
            return await Program.create(program);
        } catch (error) {
            throw error;
        }
    }

    async updateOne(id, payload) {
        try {
            return await Program.updateOne({ _id: id }, payload);
        } catch (error) {
            throw error;
        }
    }

    async find() {
        try {
            return await Program.find();
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await Program.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async findByInstitutionWithoutPagination(institutionId) {
        try {
            return await Program.find({ institutionId });
        } catch (error) {
            throw error;
        }
    }

    async aggregate(aggregationPipeline) {
        try {
            return await Program.aggregate(aggregationPipeline);
        } catch (error) {
            throw error;
        }
    }

    async aggregatePaginate(aggregate, options) {
        try {
            return await Program.aggregatePaginate(aggregate, options);
        } catch (error) {
            throw error;
        }
    }

    async archiveProgram(id) {
        try {
            return await Program.updateOne({ _id: id }, { archived: true });
        } catch (error) {
            throw error;
        }
    }

    async findByInstitutionId(id) {
        try {
            // Trouver tous les programmes liés à l'institutionId
            return  await Program.find({ id }).exec();

        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProgramRepository();
