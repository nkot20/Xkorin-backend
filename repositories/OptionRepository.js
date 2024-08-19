// repositories/OptionRepository.js
const Option = require('../models/Option');
const Language = require('../models/Language');
const OptionTranslation = require('../models/OptionTranslation');

class OptionRepository {
    async create(payload, translations) {
        try {
            const englishProposition = translations.find(proposition => proposition.isoCode === 'en');
            const option = await Option.create({
                label: englishProposition.label,
                value: payload.value,
                isItImportant: payload.isItImportant
            });

            await Promise.all(translations.map(async (optionTranslation) => {
                const language = await Language.findOne({ isoCode: optionTranslation.isoCode });
                if (language) {
                    await OptionTranslation.create({
                        label: optionTranslation.label,
                        languageId: language._id,
                        optionId: option._id
                    });
                }
            }));

            return option;
        } catch (error) {
            console.error("Error adding option: ", error);
            throw error;
        }
    }

    async findAllSortedByDate() {
        try {
            return await Option.find().sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }

    async findTranslation(optionId, languageId) {
        try {
            return await OptionTranslation.findOne({ optionId, languageId });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OptionRepository();
