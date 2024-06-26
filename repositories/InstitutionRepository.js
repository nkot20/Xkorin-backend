const Institution = require('../models/Institution');
require('dotenv').config();
const mongoose = require('mongoose');

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

    async getAll() {
        try {
            return await Institution.find();
        } catch (error) {
            throw error;
        }
    }

}

const intitutionRepository = new InstitutionRepository();
module.exports = intitutionRepository;

