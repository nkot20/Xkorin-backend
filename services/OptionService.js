// services/OptionService.js
const OptionRepository = require('../repositories/OptionRepository');
const Language = require('../models/Language'); // You might not need this in the service layer

class OptionService {
    async createOption(payload, translations) {
        try {
            return await OptionRepository.create(payload, translations);
        } catch (error) {
            throw error;
        }
    }

    async getAllOptionsByLanguage(isoCode) {
        try {
            const options = await OptionRepository.findAllSortedByDate();
            const language = await Language.findOne({ isoCode });

            if (!language) {
                throw new Error('Language not found');
            }

            let response = [];
            await Promise.all(options.map(async (option) => {
                const optionTranslation = await OptionRepository.findTranslation(option._id, language._id);
                if (optionTranslation) {
                    option.label = optionTranslation.label;
                }
                response.push(option);
            }));

            const optionsImportant = response.filter(option => option.isItImportant).reverse();
            const optionsNotImportant = response.filter(option => !option.isItImportant).reverse();

            return { optionsImportant, optionsNotImportant };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OptionService();
