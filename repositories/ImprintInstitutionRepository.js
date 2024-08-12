// repositories/ImprintInstitutionRepository.js
const mongoose = require('mongoose');
const ImprintInstitution = require('../models/ImprintInstitution');
const Imprint = require('../models/Imprint');

class ImprintInstitutionRepository {
    async create(payload) {
        try {
            return await ImprintInstitution.create(payload);
        } catch (error) {
            throw error;
        }
    }

    async findByInstitutionId(institutionId) {
        try {
            return await ImprintInstitution.find({
                institutionId: mongoose.Types.ObjectId(institutionId)
            }).sort({ createdAt: -1 }).lean();
        } catch (error) {
            throw error;
        }
    }

    async findAllImprints() {
        try {
            return await Imprint.find({}).lean();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ImprintInstitutionRepository();
