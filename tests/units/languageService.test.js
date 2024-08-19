const Language = require('../../models/Language');
const languageRepository = require('../../repositories/LanguageRepository');

// Mock the Language model
jest.mock('../../models/Language');

describe('LanguageService', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear any mocked calls between tests
    });

    describe('create', () => {
        it('should create a new language and return it', async () => {
            const payload = { label: 'English', isoCode: 'en' };
            const createdLanguage = { ...payload, _id: '123' };

            // Mock the create method to return the created language
            Language.create.mockResolvedValue(createdLanguage);

            const result = await languageRepository.create(payload);

            expect(Language.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(createdLanguage);
        });

        it('should throw an error if creation fails', async () => {
            const payload = { label: 'English', isoCode: 'en' };
            const error = new Error('Creation failed');

            // Mock the create method to throw an error
            Language.create.mockRejectedValue(error);

            await expect(languageRepository.create(payload)).rejects.toThrow('Creation failed');
        });
    });

    describe('getAll', () => {
        it('should return all languages', async () => {
            const languages = [
                { label: 'English', isoCode: 'en', _id: '1' },
                { label: 'French', isoCode: 'fr', _id: '2' },
            ];

            // Mock the find method to return a list of languages
            Language.find.mockResolvedValue(languages);

            const result = await languageRepository.getAll();

            expect(Language.find).toHaveBeenCalledWith();
            expect(result).toEqual(languages);
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetch failed');

            // Mock the find method to throw an error
            Language.find.mockRejectedValue(error);

            await expect(languageRepository.getAll()).rejects.toThrow('Fetch failed');
        });
    });
});
