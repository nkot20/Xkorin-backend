// services/ProfilService.js
const ProfilRepository = require('../repositories/ProfilRepository');

class ProfilService {
    async createProfilWithTranslations(translations) {
        try {
            const englishProfil = translations.find(profil => profil.isoCode === 'en');
            if (!englishProfil) {
                throw new Error('English translation is required');
            }

            const newProfil = await ProfilRepository.createProfil({ label: englishProfil.label });

            await Promise.all(translations.map(async (profil) => {
                const language = await ProfilRepository.findLanguageByIsoCode(profil.isoCode);
                if (language) {
                    await ProfilRepository.createProfilTranslation({
                        label: profil.label,
                        languageId: language._id,
                        profilId: newProfil._id
                    });
                }
            }));

            return newProfil;
        } catch (error) {
            console.error("Error creating profil with translations: ", error);
            throw error;
        }
    }

    async getAllProfilsWithTranslations() {
        try {
            const profils = await ProfilRepository.findAllProfils();
            const response = [];

            await Promise.all(profils.map(async (profil) => {
                const profilTranslations = await ProfilRepository.findProfilTranslations(profil._id);
                const translation = profilTranslations.map(t => t.label).join(' / ');
                response.push({ profil, translation });
            }));

            return response;
        } catch (error) {
            console.error("Error getting all profils with translations: ", error);
            throw error;
        }
    }

    async getAllProfilsByLanguage(isoCode) {
        try {
            const language = await ProfilRepository.findLanguageByIsoCode(isoCode);
            if (!language) {
                throw new Error('Language not found');
            }

            const profils = await ProfilRepository.findAllProfils();
            const response = [];

            await Promise.all(profils.map(async (profil) => {
                const profilTranslation = await ProfilRepository.findProfilTranslationByLanguage(profil._id, language._id);
                profil.label = profilTranslation ? profilTranslation.label : profil.label;
                response.push(profil);
            }));

            return response;
        } catch (error) {
            console.error("Error getting all profils by language: ", error);
            throw error;
        }
    }

    async getProfilById(id) {
        try {
            return await ProfilRepository.findProfilById(id);
        } catch (error) {
            console.error("Error getting profil by ID: ", error);
            throw error;
        }
    }
}

module.exports = new ProfilService();
