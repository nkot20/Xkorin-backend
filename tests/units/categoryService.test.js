const mongoose = require('mongoose');
const categoryService = require('../../services/CategoryService');
const Category = require('../../models/Category');
const CategoryTranslation = require('../../models/CategoryTranslation');
const Language = require('../../models/Language');
const LanguageRepository = require('../../repositories/LanguageRepository');

describe('CategoryService', () => {
    let englishLanguage, polishLanguage;

    beforeEach(async () => {
        // Create languages before each test
        englishLanguage = await Language.create({ label: 'English', isoCode: 'en' });
        polishLanguage = await Language.create({ label: 'Polish', isoCode: 'pl' });
    });
   /* describe('create', () => {
        it('should create and return a new category with translations', async () => {
           const translations = [
                { label: 'Test Category', isoCode: 'en' },
                { label: 'Test Kategoria', isoCode: 'pl' }
            ];

            const category = await categoryService.createCategoryWithTranslations({type: "institution"}, translations);

            expect(category).toBeDefined();
            expect(category.label).toBe('Test Category');

            const translationsInDb = await CategoryTranslation.find({ categoryId: category._id });
            //console.log(translationsInDb)
            expect(translationsInDb.length).toBe(2);
            expect(translationsInDb[0].label).toBe('Test Category');
            expect(translationsInDb[1].label).toBe('Test Kategoria');
        });

        it('should throw an error if no English translation is provided', async () => {
            const translations = [
                { label: 'Test Kategoria', isoCode: 'pl' }
            ];

            await expect(categoryService.createCategoryWithTranslations({type: "institution"}, translations)).rejects.toThrow('English translation is required');
        });
    });
*/
    describe('getAll', () => {
        it('should return all categories with their translations', async () => {
            const category = await Category.create({ label: 'Test Category', type: 'company' });
            await CategoryTranslation.create({ label: 'Test Category', languageId: englishLanguage._id, categoryId: category._id });

            const result = await categoryService.getAllCategoriesWithTranslations();

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].category.label).toBe('Test Category');
        });
    });

    describe('getAllByLangage', () => {
        it('should return categories with labels translated into the specified language', async () => {

            const category = await Category.create({ label: 'Test Category', type: 'company' });
            await CategoryTranslation.create({ label: 'Test Kategoria', languageId: polishLanguage._id, categoryId: category._id });

            const result = await categoryService.getAllCategoriesByLanguage('pl');
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].label).toBe('Test Kategoria');
        });

        it('should throw an error if the language does not exist', async () => {
            await expect(categoryService.getAllCategoriesByLanguage('nonexistent')).rejects.toThrow('Language not found');
        });
    });
});
