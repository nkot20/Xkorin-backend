const SubCategoryService = require('../../services/SubCategoryService');
const SubCategoryRepository = require('../../repositories/SubCategoryRepository');

jest.mock('../../repositories/SubCategoryRepository');

describe('SubCategoryService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSubCategoryWithTranslations', () => {
        it('should create subcategory with translations successfully', async () => {
            const payload = { categoryId: 'category123' };
            const translations = [
                { isoCode: 'en', label: 'English Label' },
                { isoCode: 'fr', label: 'French Label' }
            ];

            const mockSubCategory = { _id: 'subCategory123', label: 'English Label' };

            SubCategoryRepository.createSubCategory.mockResolvedValue(mockSubCategory);
            SubCategoryRepository.findLanguageByIsoCode.mockResolvedValue({ _id: 'language123' });
            SubCategoryRepository.createSubCategoryTranslation.mockResolvedValue({});

            const result = await SubCategoryService.createSubCategoryWithTranslations(payload, translations);

            expect(SubCategoryRepository.createSubCategory).toHaveBeenCalledWith({
                label: 'English Label',
                categoryId: 'category123'
            });
            expect(SubCategoryRepository.createSubCategoryTranslation).toHaveBeenCalledTimes(2);  // For 'en' and 'fr'
            expect(result).toEqual(mockSubCategory);
        });

        it('should throw error if English translation is not provided', async () => {
            const payload = { categoryId: 'category123' };
            const translations = [{ isoCode: 'fr', label: 'French Label' }];

            await expect(SubCategoryService.createSubCategoryWithTranslations(payload, translations))
                .rejects
                .toThrow('English translation is required');
        });

        it('should throw error if an error occurs while creating subcategory', async () => {
            const payload = { categoryId: 'category123' };
            const translations = [
                { isoCode: 'en', label: 'English Label' }
            ];

            SubCategoryRepository.createSubCategory.mockRejectedValue(new Error('Database error'));

            await expect(SubCategoryService.createSubCategoryWithTranslations(payload, translations))
                .rejects
                .toThrow('Database error');
        });
    });

    describe('getAllSubCategoriesWithTranslations', () => {
        it('should return all subcategories with translations', async () => {
            const subCategories = [{ _id: 'subCategory123', label: 'Label' }];
            const translations = [
                { subcategoryId: 'subCategory123', label: 'English Label' },
                { subcategoryId: 'subCategory123', label: 'French Label' }
            ];

            SubCategoryRepository.findAllSubCategories.mockResolvedValue(subCategories);
            SubCategoryRepository.findSubCategoryTranslations.mockResolvedValue(translations);

            const result = await SubCategoryService.getAllSubCategoriesWithTranslations();

            expect(SubCategoryRepository.findAllSubCategories).toHaveBeenCalled();
            expect(SubCategoryRepository.findSubCategoryTranslations).toHaveBeenCalledWith('subCategory123');
            expect(result).toEqual([
                { subCategory: subCategories[0], translation: 'English Label / French Label' }
            ]);
        });

        it('should throw error if an error occurs while retrieving subcategories', async () => {
            SubCategoryRepository.findAllSubCategories.mockRejectedValue(new Error('Database error'));

            await expect(SubCategoryService.getAllSubCategoriesWithTranslations())
                .rejects
                .toThrow('Database error');
        });
    });

    describe('getAllSubCategoriesByLanguageAndCategory', () => {
        it('should return subcategories by language and category', async () => {
            const isoCode = 'en';
            const idCategory = 'category123';
            const language = { _id: 'language123', isoCode: 'en' };
            const subCategories = [{ _id: 'subCategory123', label: 'Default Label' }];
            const translation = { label: 'Translated Label' };

            SubCategoryRepository.findLanguageByIsoCode.mockResolvedValue(language);
            SubCategoryRepository.findSubCategoriesByCategoryId.mockResolvedValue(subCategories);
            SubCategoryRepository.findSubCategoryTranslation.mockResolvedValue(translation);

            const result = await SubCategoryService.getAllSubCategoriesByLanguageAndCategory(isoCode, idCategory);

            expect(SubCategoryRepository.findLanguageByIsoCode).toHaveBeenCalledWith('en');
            expect(SubCategoryRepository.findSubCategoriesByCategoryId).toHaveBeenCalledWith(idCategory);
            expect(SubCategoryRepository.findSubCategoryTranslation).toHaveBeenCalledWith('subCategory123', 'language123');
            expect(result).toEqual([{ _id: 'subCategory123', label: 'Translated Label' }]);
        });

        it('should return default label if no translation is found', async () => {
            const isoCode = 'en';
            const idCategory = 'category123';
            const language = { _id: 'language123', isoCode: 'en' };
            const subCategories = [{ _id: 'subCategory123', label: 'Default Label' }];

            SubCategoryRepository.findLanguageByIsoCode.mockResolvedValue(language);
            SubCategoryRepository.findSubCategoriesByCategoryId.mockResolvedValue(subCategories);
            SubCategoryRepository.findSubCategoryTranslation.mockResolvedValue(null);

            const result = await SubCategoryService.getAllSubCategoriesByLanguageAndCategory(isoCode, idCategory);

            expect(result).toEqual([{ _id: 'subCategory123', label: 'Default Label' }]);
        });

        it('should throw error if an error occurs while retrieving subcategories by language and category', async () => {
            SubCategoryRepository.findLanguageByIsoCode.mockRejectedValue(new Error('Database error'));

            await expect(SubCategoryService.getAllSubCategoriesByLanguageAndCategory('en', 'category123'))
                .rejects
                .toThrow('Database error');
        });
    });
});
