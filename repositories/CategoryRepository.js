require('dotenv').config();
const Category = require('../models/Category');
const CategoryTranslation = require('../models/CategoryTranslation');
const Language = require("../models/Language");
const Proposition = require("../models/Proposition");
const PropositionTranslation = require("../models/PropositionTranslation");

class CategoryRepository {
    async create(payload, translations) {
        try {
            const englishCategory = translations.filter(translation => translation.isoCode === 'en');
            const category = await Category.create({label: englishCategory[0].label});
            await Promise.all(translations.map(async (categoryTranslation) => {
                const language = await Language.findOne({ isoCode: categoryTranslation.isoCode });
                if (language) {
                    await CategoryTranslation.create({ label: categoryTranslation.label, languageId: language._id, categoryId: category._id });
                    return language._id;
                }
            }));
            return category;
        } catch (error) {
            console.error("Erreur lors de l'ajout du de la proposition: ", error);
            throw error;
        }
    }

    async getAll() {
        try {
            const categories = await Category.find();
            let response = [];
            await Promise.all(categories.map(async (category) => {
                const categoryTranslations = await CategoryTranslation.find({categoryId: category._id});
                let translation = '';
                categoryTranslations.forEach(value => {
                    translation += value.label + ' / '
                })
                translation = translation.substring(0, translation.length - 2)
                response.push({category, translation});
            }))
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAllByLangage(isoCode) {
        try {
            const language = await Language.findOne({isoCode})
            const categories = await Category.find();
            let response = [];
            await Promise.all(categories.map(async (category) => {
                const categoryTranslation = await CategoryTranslation.findOne({categoryId: category._id, languageId: language._id});
                category.label = categoryTranslation.label;
                response.push(category);
            }))
            return response;
        } catch (error) {
            throw error;
        }
    }




}

const categoryRepository = new CategoryRepository();
module.exports = categoryRepository;