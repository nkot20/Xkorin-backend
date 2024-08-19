// repositories/SubCategoryRepository.js
const SubCategory = require('../models/SubCategory');
const SubCategoryTranslation = require('../models/SubCategoryTranslation');
const Language = require('../models/Language');

class SubCategoryRepository {
    async createSubCategory(subCategoryData) {
        try {
            return await SubCategory.create(subCategoryData);
        } catch (error) {
            console.error("Error creating subcategory: ", error);
            throw error;
        }
    }

    async createSubCategoryTranslation(translationData) {
        try {
            return await SubCategoryTranslation.create(translationData);
        } catch (error) {
            console.error("Error creating subcategory translation: ", error);
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

    async findAllSubCategories() {
        try {
            return await SubCategory.find();
        } catch (error) {
            console.error("Error finding subcategories: ", error);
            throw error;
        }
    }

    async findSubCategoryTranslations(subCategoryId) {
        try {
            return await SubCategoryTranslation.find({ subcategoryId: subCategoryId });
        } catch (error) {
            console.error("Error finding subcategory translations: ", error);
            throw error;
        }
    }

    async findSubCategoriesByCategoryId(categoryId) {
        try {
            return await SubCategory.find({ categoryId });
        } catch (error) {
            console.error("Error finding subcategories by category: ", error);
            throw error;
        }
    }

    async findSubCategoryTranslation(subCategoryId, languageId) {
        try {
            return await SubCategoryTranslation.findOne({ subCategoryId, languageId });
        } catch (error) {
            console.error("Error finding subcategory translation: ", error);
            throw error;
        }
    }
}

module.exports = new SubCategoryRepository();
