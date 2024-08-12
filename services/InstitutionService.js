// services/InstitutionService.js
const InstitutionRepository = require('../repositories/InstitutionRepository');
const ProgramService = require('../services/ProgramService');
const UserRepository = require('../repositories/UserRepository');

class InstitutionService {
    async createInstitution(payload) {
        try {
            return await InstitutionRepository.create(payload);
        } catch (error) {
            throw error;
        }
    }

    async updateInstitution(id, payload) {
        try {
            return await InstitutionRepository.update(id, payload);
        } catch (error) {
            throw error;
        }
    }

    async updateAfterFirstInscription(userId, institutionId, payload) {
        try {
            const updatedInstitution = await this.updateInstitution(institutionId, payload.institution);

            await ProgramService.create({
                institutionId,
                name: payload.program.name,
                targetInstitutionId: payload.program.targetInstitutionId
            });

            await UserRepository.updateUser(userId, { alreadyLogin: true });

            return updatedInstitution;
        } catch (error) {
            throw error;
        }
    }

    async getAllInstitutions() {
        try {
            return await InstitutionRepository.findAll();
        } catch (error) {
            throw error;
        }
    }

    async getInstitutionByName(name) {
        try {
            return await InstitutionRepository.findByName(name);
        } catch (error) {
            throw error;
        }
    }

    async getInstitutionsByType(type) {
        try {
            return await InstitutionRepository.findByType(type);
        } catch (error) {
            throw error;
        }
    }

    async getInstitutionById(id) {
        try {
            return await InstitutionRepository.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async getInstitutionByAdminId(id) {
        try {
            return await InstitutionRepository.findByAdminId(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InstitutionService();
