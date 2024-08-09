const Option = require("../models/Option");
const Language = require("../models/Language");
const OptionTranslation = require("../models/OptionTranslation");

class OptionRepository {

    async create(payload, translations) {
        try {
            const englishProposition = translations.filter(proposition => proposition.isoCode === 'en');
            const option = await Option.create({label: englishProposition[0].label, value: payload.value, isItImportant: payload.isItImportant});
            await Promise.all(translations.map(async (optionTranslation) => {
                const language = await Language.findOne({ isoCode: optionTranslation.isoCode });
                if (language) {
                    await OptionTranslation.create({ label: optionTranslation.label, languageId: language._id, optionId: option._id });
                    return language._id;
                }
            }));
            return option;
        } catch (error) {
            console.error("Erreur lors de l'ajout du de la proposition: ", error);
            throw error;
        }
    }

    async getAllByIsoCodeLanguage(isoCode) {
        try {
            const options = await Option.find().sort({createdAt: -1});
            let response = [];
            const language = await Language.findOne({isoCode});
            await Promise.all(options.map(async (option) => {
                const optionTranslation = await OptionTranslation.findOne({optionId: option._id, languageId: language._id});
                option.label = optionTranslation.label;
                response.push(option);
            }));
            const optionsImportant = (response.filter((option) => option.isItImportant)).reverse();
            const optionsNotImportant = (response.filter((option) => !(option.isItImportant))).reverse();
            return {optionsImportant, optionsNotImportant};
        } catch (error) {
            throw error;
        }
    }


}

const optionRepository = new OptionRepository();
module.exports = optionRepository;
