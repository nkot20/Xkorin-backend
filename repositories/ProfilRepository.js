// repositories/ProfilRepository.js
const Profil = require('../models/Profil');
const ProfilTranslation = require('../models/ProfilTranslation');
const Language = require("../models/Language");

class ProfilRepository {
    async createProfil(profilData) {
        try {
            return await Profil.create(profilData);
        } catch (error) {
            console.error("Error creating profil: ", error);
            throw error;
        }
    }

    async createProfilTranslation(profilTranslationData) {
        try {
            return await ProfilTranslation.create(profilTranslationData);
        } catch (error) {
            console.error("Error creating profil translation: ", error);
            throw error;
        }
    }

    async findLanguageByIsoCode(isoCode) {
        try {
            return await Language.findOne({ isoCode });
        } catch (error) {
            console.error("Error finding language: ", error);
            throw error;
        }
    }

    async findAllProfils() {
        try {
            return await Profil.find();
        } catch (error) {
            throw error;
        }
    }

    async findProfilTranslations(profilId) {
        try {
            return await ProfilTranslation.find({ profilId });
        } catch (error) {
            throw error;
        }
    }

    async findProfilTranslationByLanguage(profilId, languageId) {
        try {
            return await ProfilTranslation.findOne({ profilId, languageId });
        } catch (error) {
            throw error;
        }
    }

    async findProfilById(id) {
        try {
            return await Profil.findById(id);
        } catch (error) {
            console.error("Error finding profil: ", error);
            throw error;
        }
    }
}

module.exports = new ProfilRepository();
