// repositories/InstitutionRepository.js
const mongoose = require('mongoose');
const Institution = require('../models/Institution');

class InstitutionRepository {
    async create(payload) {
        try {
            const institution = await Institution.findOne({ name: payload.name });
            if (institution) {
                throw new Error('Institution is already exists');
            }
            const newInstitution = new Institution(payload);
            return await newInstitution.save();
        } catch (error) {
            throw error;
        }
    }

    async update(id, payload) {
        try {
            return await Institution.updateOne({ _id: id }, payload);
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            return await Institution.find();
        } catch (error) {
            throw error;
        }
    }

    async findByName(name) {
        try {
            return await Institution.findOne({ name });
        } catch (error) {
            throw error;
        }
    }

    async findByType(type) {
        try {
            return await Institution.find({ type });
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await Institution.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async findByAdminId(id) {
        try {
            return await Institution.findOne({ adminId: mongoose.Types.ObjectId(id) });
        } catch (error) {
            throw error;
        }
    }

    async findByStatus(status) {
        try {
            return await Institution.find({status});
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InstitutionRepository();
