require('dotenv').config();
const Profil = require('../models/Profil');
const ProfilTranslation = require('../models/ProfilTranslation')
const Question = require("../models/Question");
const Language = require("../models/Language");
const QuestionTranslation = require("../models/QuestionTranslation");
const PropositionTranslation = require("../models/PropositionTranslation");

class ProfilRepository {
    async create(translations) {
        try {
            const englishProfil = translations.filter(profil => profil.isoCode === 'en');
            const newProfil = await Profil.create({label: englishProfil[0].label});

            await Promise.all(translations.map(async (profil) => {

                const language = await Language.findOne({ isoCode: profil.isoCode });
                if (language) {
                    await ProfilTranslation.create({ label: profil.label, languageId: language._id, profilId: newProfil._id });
                    return language._id;
                }
            }));
            return newProfil
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

    async getAll() {
        try {
            const profils = await Profil.find();
            let response = [];
            await Promise.all(profils.map(async (profil) => {
                const profilTranslation = await ProfilTranslation.find({profilId: profil._id});
                let translation = '';
                profilTranslation.forEach(value => {
                    translation += value.label + ' / '
                })
                translation = translation.substring(0, translation.length - 2)
                response.push({profil, translation});
            }))
            return response;
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }


    async getProfilById(id) {
        try {
            return await Profil.findById(id);
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

}

const profilRepository = new ProfilRepository();
module.exports = profilRepository;