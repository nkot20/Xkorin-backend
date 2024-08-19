require('dotenv').config();
const Language = require('../models/Language');

class LanguageRepository {
    async create(payload) {
        try {
            return await Language.create(payload);
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

    async getAll() {
        try {
            return await Language.find();
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

    async findLanguageByIsoCode (isoCode){
        const language = await Language.findOne({ isoCode: isoCode });
        return language;
    }

}

const languageRepository = new LanguageRepository();
module.exports = languageRepository;