const mongoose = require('mongoose');
const CategoryRepository = require('../repositories/CategoryRepository');
const Category = require('../models/Category');
const CategoryTranslation = require('../models/CategoryTranslation');
const Language = require('../models/Language');

describe('CategoryRepository', () => {
    describe('create', () => {
        it('should create and return a new category with translations', async () => {
            const languages = await Language.create([{ label: 'English', isoCode: 'en' }, { label: 'Polish', isoCode: 'pl' }]);
            const translations = [
                { label: 'Test Category', isoCode: 'en' },
                { label: 'Test Kategoria', isoCode: 'pl' }
            ];

            const category = await CategoryRepository.create({type: "institution"}, translations);
            expect(category).toBeDefined();
            expect(category.label).toBe('Test Category');

            const translationsInDb = await CategoryTranslation.find({ categoryId: category._id });
            expect(translationsInDb.length).toBe(2);
            expect(translationsInDb[0].label).toBe('Test Category');
            expect(translationsInDb[1].label).toBe('Test Kategoria');
        });

        it('should throw an error if no English translation is provided', async () => {
            const translations = [
                { label: 'Test Kategoria', isoCode: 'pl' }
            ];

            await expect(CategoryRepository.create({type: "institution"}, translations)).rejects.toThrow('English translation is required');
        });
    });

    describe('getAll', () => {
        it('should return all categories with their translations', async () => {
            const language = await Language.create({ label: 'English', isoCode: 'en' });
            const category = await Category.create({ label: 'Test Category', type: 'company' });
            await CategoryTranslation.create({ label: 'Test Category', languageId: language._id, categoryId: category._id });

            const result = await CategoryRepository.getAll();

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].category.label).toBe('Test Category');
        });
    });

    describe('getAllByLangage', () => {
        it('should return categories with labels translated into the specified language', async () => {
            const language = await Language.create({ label: 'Polish', isoCode: 'pl' });
            const category = await Category.create({ label: 'Test Category', type: 'company' });
            await CategoryTranslation.create({ label: 'Test Kategoria', languageId: language._id, categoryId: category._id });

            const result = await CategoryRepository.getAllByLangage('pl');
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].label).toBe('Test Kategoria');
        });

        it('should throw an error if the language does not exist', async () => {
            await expect(CategoryRepository.getAllByLangage('nonexistent')).rejects.toThrow('Language not found');
        });
    });
});
