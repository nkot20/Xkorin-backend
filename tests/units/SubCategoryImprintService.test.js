// tests/SubCategoryImprintService.test.js
const SubCategoryImprintService = require('../../services/SubCategoryImprintService');
const SubCategoryImprintRepository = require('../../repositories/SubCategoryImprintRepository');

jest.mock('../../repositories/SubCategoryImprintRepository');

describe('SubCategoryImprintService', () => {

    describe('createSubCategoryImprint', () => {
        it('should create a subcategory imprint successfully', async () => {
            const imprintId = 'imprintId123';
            const subcategoryId = 'subcategoryId123';
            const createdSubCategoryImprint = { imprintId, subcategoryId };

            // Mock the repository function
            SubCategoryImprintRepository.createSubCategoryImprint.mockResolvedValue(createdSubCategoryImprint);

            // Call the service function
            const result = await SubCategoryImprintService.createSubCategoryImprint(imprintId, subcategoryId);

            // Assert that the repository function was called with the correct parameters
            expect(SubCategoryImprintRepository.createSubCategoryImprint).toHaveBeenCalledWith(imprintId, subcategoryId);
            // Assert that the result is as expected
            expect(result).toEqual(createdSubCategoryImprint);
        });

        it('should throw an error if creation fails', async () => {
            const imprintId = 'imprintId123';
            const subcategoryId = 'subcategoryId123';
            const errorMessage = 'Error creating subcategory imprint';

            // Mock the repository function to throw an error
            SubCategoryImprintRepository.createSubCategoryImprint.mockRejectedValue(new Error(errorMessage));

            // Call the service function and expect it to throw an error
            await expect(SubCategoryImprintService.createSubCategoryImprint(imprintId, subcategoryId))
                .rejects
                .toThrow(errorMessage);

            // Assert that the repository function was called
            expect(SubCategoryImprintRepository.createSubCategoryImprint).toHaveBeenCalledWith(imprintId, subcategoryId);
        });
    });

    describe('getImprintIdsBySubcategoryId', () => {
        it('should return imprint IDs by subcategory ID successfully', async () => {
            const subcategoryId = 'subcategoryId123';
            const imprintIds = ['imprintId1', 'imprintId2'];

            // Mock the repository function
            SubCategoryImprintRepository.findImprintIdsBySubcategoryId.mockResolvedValue(imprintIds);

            // Call the service function
            const result = await SubCategoryImprintService.getImprintIdsBySubcategoryId(subcategoryId);

            // Assert that the repository function was called with the correct parameter
            expect(SubCategoryImprintRepository.findImprintIdsBySubcategoryId).toHaveBeenCalledWith(subcategoryId);
            // Assert that the result is as expected
            expect(result).toEqual(imprintIds);
        });

        it('should throw an error if fetching imprint IDs fails', async () => {
            const subcategoryId = 'subcategoryId123';
            const errorMessage = 'Error getting imprint IDs';

            // Mock the repository function to throw an error
            SubCategoryImprintRepository.findImprintIdsBySubcategoryId.mockRejectedValue(new Error(errorMessage));

            // Call the service function and expect it to throw an error
            await expect(SubCategoryImprintService.getImprintIdsBySubcategoryId(subcategoryId))
                .rejects
                .toThrow(errorMessage);

            // Assert that the repository function was called
            expect(SubCategoryImprintRepository.findImprintIdsBySubcategoryId).toHaveBeenCalledWith(subcategoryId);
        });
    });
});
