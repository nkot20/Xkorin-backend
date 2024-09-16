require('dotenv').config();
const CategoryRepository = require('../repositories/CategoryRepository');
const CategoryTranslationRepository = require('../repositories/CategoryTranslationRepository');
const LanguageRepository = require('../repositories/LanguageRepository');

class CategoryService {
    async createCategoryWithTranslations(payload, translations) {
        try {
            console.log(translations)
            const englishCategory = translations.find(translation => translation.isoCode === 'en');
            if (!englishCategory) {
                throw new Error('English translation is required');
            }

            const category = await CategoryRepository.createCategory({
                label: englishCategory.label,
                type: payload.type
            });

            await Promise.all(translations.map(async (categoryTranslation) => {
                const language = await LanguageRepository.findLanguageByIsoCode(categoryTranslation.isoCode);

                if (language) {
                    const categoryTranslationRepository = await CategoryTranslationRepository.createCategoryTranslation({
                        label: categoryTranslation.label,
                        languageId: language._id,
                        categoryId: category._id
                    });
                }
            }));

            return category;
        } catch (error) {
            console.error("Error creating category: ", error);
            throw error;
        }
    }

    async getAllCategory() {
        try {
            return await CategoryRepository.findAllCategories();
        } catch (error) {
            console.error("Error creating category: ", error);
            throw error;
        }
    }

    async getAllCategoriesWithTranslations() {
        try {
            const categories = await CategoryRepository.findAllCategories();
            const response = [];

            await Promise.all(categories.map(async (category) => {
                const categoryTranslations = await CategoryTranslationRepository.findCategoryTranslationsByCategoryId(category._id);
                let translation = categoryTranslations.map(value => value.label).join(' / ');
                response.push({ category, translation });
            }));

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAllCategoriesByLanguage(isoCode) {
        try {
            const language = await LanguageRepository.findLanguageByIsoCode(isoCode);
            if (!language) {
                throw new Error('Language not found');
            }

            const categories = await CategoryRepository.findAllCategories();
            const response = [];

            await Promise.all(categories.map(async (category) => {
                const categoryTranslation = await CategoryTranslationRepository.findCategoryTranslationByCategoryIdAndLanguageId(category._id, language._id);
                category.label = categoryTranslation ? categoryTranslation.label : category.label;
                response.push(category);
            }));

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * get category with them translation
     * @param id
     * @returns {Promise<{translation: *, category: Category}
     */
    async getCategoryWithTranslation(id) {
        try {
            const category = await CategoryRepository.findCategoryById(id);
            const categoryTranslations = await CategoryTranslationRepository.findCategoryTranslationsByCategoryId(category._id);
            return { category, translations: categoryTranslations };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryService();
