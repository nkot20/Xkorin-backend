const CategoryTranslation = require('../models/CategoryTranslation');

class CategoryTranslationRepository {
    async createCategoryTranslation(translationData) {
        try {
            return await CategoryTranslation.create(translationData);
        } catch (error) {
            throw error;
        }
    }

    async findCategoryTranslationsByCategoryId(categoryId) {
        try {
            return await CategoryTranslation.find({ categoryId });
        } catch (error) {
            throw error;
        }
    }

    async findCategoryTranslationByCategoryIdAndLanguageId(categoryId, languageId) {
        try {
            return await CategoryTranslation.findOne({ categoryId, languageId });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryTranslationRepository();
