// services/SubCategoryService.js
const SubCategoryRepository = require('../repositories/SubCategoryRepository');

class SubCategoryService {
    async createSubCategoryWithTranslations(payload, translations) {
        try {
            const englishCategory = translations.find(translation => translation.isoCode === 'en');
            if (!englishCategory) {
                throw new Error('English translation is required');
            }

            const subCategory = await SubCategoryRepository.createSubCategory({
                label: englishCategory.label,
                categoryId: payload.categoryId
            });

            await Promise.all(translations.map(async (subCategoryTranslation) => {
                const language = await SubCategoryRepository.findLanguageByIsoCode(subCategoryTranslation.isoCode);
                if (language) {
                    await SubCategoryRepository.createSubCategoryTranslation({
                        label: subCategoryTranslation.label,
                        languageId: language._id,
                        subcategoryId: subCategory._id
                    });
                }
            }));

            return subCategory;
        } catch (error) {
            console.error("Error creating subcategory with translations: ", error);
            throw error;
        }
    }

    async getAllSubCategoriesWithTranslations() {
        try {
            const subCategories = await SubCategoryRepository.findAllSubCategories();
            const response = await Promise.all(subCategories.map(async (subCategory) => {
                const subCategoryTranslations = await SubCategoryRepository.findSubCategoryTranslations(subCategory._id);
                const translation = subCategoryTranslations.map(value => value.label).join(' / ');
                return { subCategory, translation };
            }));

            return response;
        } catch (error) {
            console.error("Error getting all subcategories with translations: ", error);
            throw error;
        }
    }

    async getAllSubCategoriesByLanguageAndCategory(isoCode, idCategory) {
        try {
            const language = await SubCategoryRepository.findLanguageByIsoCode(isoCode);
            const subCategories = await SubCategoryRepository.findSubCategoriesByCategoryId(idCategory);
            const response = await Promise.all(subCategories.map(async (subCategory) => {
                const subCategoryTranslation = await SubCategoryRepository.findSubCategoryTranslation(subCategory._id, language._id);
                subCategory.label = subCategoryTranslation ? subCategoryTranslation.label : subCategory.label;
                return subCategory;
            }));

            return response;
        } catch (error) {
            console.error("Error getting subcategories by language and category: ", error);
            throw error;
        }
    }
}

module.exports = new SubCategoryService();
