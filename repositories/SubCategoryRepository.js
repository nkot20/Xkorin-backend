require('dotenv').config();
const SubCategory = require('../models/SubCategory');
const SubCategoryTranslation = require('../models/SubCategoryTranslation');
const Language = require("../models/Language");

class SubCategoryRepository {
    async create(payload, translations) {
        try {
            const englishCategory = translations.filter(translation => translation.isoCode === 'en');
            const subCategory = await SubCategory.create({label: englishCategory[0].label, categoryId: payload.categoryId});
            await Promise.all(translations.map(async (subCategoryTranslation) => {
                const language = await Language.findOne({ isoCode: subCategoryTranslation.isoCode });
                if (language) {
                    await SubCategoryTranslation.create({ label: subCategoryTranslation.label, languageId: language._id, subcategoryId: subCategory._id });
                    return language._id;
                }
            }));
            return subCategory;
        } catch (error) {
            console.error("Erreur lors de l'ajout du de la proposition: ", error);
            throw error;
        }
    }

    async getAll() {
        try {
            const categories = await SubCategory.find();
            let response = [];
            await Promise.all(categories.map(async (subCategory) => {
                const subCategoryTranslations = await SubCategoryTranslation.find({subcategoryId: subCategory._id});
                let translation = '';
                subCategoryTranslations.forEach(value => {
                    translation += value.label + ' / '
                })
                translation = translation.substring(0, translation.length - 2)
                response.push({subCategory, translation});
            }))
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAllByLangageAndCategory(isoCode, idCategory) {
        try {
            const language = await Language.findOne({isoCode})
            const subCategories = await SubCategory.find({categoryId: idCategory});
            let response = [];
            await Promise.all(subCategories.map(async (subCategory) => {
                const subCategoryTranslation = await SubCategoryTranslation.findOne({subcategoryId: subCategory._id, languageId: language._id});
                subCategory.label = subCategoryTranslation.label;
                response.push(subCategory);
            }))
            return response;
        } catch (error) {
            throw error;
        }
    }




}

const subCategoryRepository = new SubCategoryRepository();
module.exports = subCategoryRepository;