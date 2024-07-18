
require('dotenv').config();
const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
const userRepository = require('../repositories/UserRepository');
const Institution = require('../models/Institution');
const programRepository = require('../repositories/ProgramRepository');

class InstitutionRepository {

    async create(payload) {
        try {
            const institution =  await Institution.findOne({name: payload.name});
            if (institution)
                throw new Error('Institution is already exist');
            const newInstitution = new Institution(payload);
            return await newInstitution.save();
        } catch (error) {
            throw error;
        }
    }

    async update(id, payload) {
        try {
            return await Institution.updateOne({_id: id}, payload);
        } catch (error) {
            throw error;
        }
    }

    async updateAfterFirstInscription(userId, institutionId, payload) {
        try {

            const newInstitution = await this.update(institutionId, payload.institution);
            await programRepository.create({
                institutionId,
                name: payload.program.name,
                targetInstitutionId: payload.program.targetInstitutionId
            });
            await userRepository.updateUser(userId, {alreadyLogin: true})
            return newInstitution;
        } catch (error) {
            throw Error;
        }
    }

    async getAll() {
        try {
            return await Institution.find();
        } catch (error) {
            throw error;
        }
    }

    async getByName(name) {
        try {
            return await Institution.findOne({name});
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            return await Institution.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async getByAdminId(id) {
        try {
            return await Institution.findOne({adminId: new ObjectId(id)});
        } catch (error) {
            throw error;
        }
    }


}

const intitutionRepository = new InstitutionRepository();
module.exports = intitutionRepository;

