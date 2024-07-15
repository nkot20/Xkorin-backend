const Program = require('../models/Program');
require('dotenv').config();
const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");

class ProgramRepository {

    async create(payload) {
        try {
            const program =  await Program.findOne({name: payload.name});
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

    async listAllInstitutionProgram(institutionId) {
        try {
            return await Program.find({institutionId});
        } catch (error) {
            throw error;
        }
    }

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

