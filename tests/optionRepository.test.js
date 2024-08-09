const Option = require('../models/Option');
const Language = require('../models/Language');
const OptionTranslation = require('../models/OptionTranslation');
const optionRepository = require('../repositories/OptionRepository');

// Mock the models
jest.mock('../models/Option');
jest.mock('../models/Language');
jest.mock('../models/OptionTranslation');

describe('OptionRepository', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear any mocked calls between tests
    });

    describe('create', () => {
        it('should create an option and its translations', async () => {
            const payload = { value: 10, isItImportant: true };
            const translations = [
                { isoCode: 'en', label: 'Option English' },
                { isoCode: 'fr', label: 'Option French' }
            ];

            const createdOption = { _id: 'optionId', label: 'Option English', ...payload };
            const englishLanguage = { _id: 'languageId', isoCode: 'en', label: 'English' };
            const frenchLanguage = { _id: 'languageIdFr', isoCode: 'fr', label: 'French' };

            Option.create.mockResolvedValue(createdOption);
            Language.findOne
                .mockResolvedValueOnce(englishLanguage)
                .mockResolvedValueOnce(frenchLanguage);
            OptionTranslation.create.mockResolvedValue({});

            const result = await optionRepository.create(payload, translations);

            expect(Option.create).toHaveBeenCalledWith({
                label: 'Option English',
                value: payload.value,
                isItImportant: payload.isItImportant
            });

            expect(Language.findOne).toHaveBeenCalledWith({ isoCode: 'en' });
            expect(Language.findOne).toHaveBeenCalledWith({ isoCode: 'fr' });

            expect(OptionTranslation.create).toHaveBeenCalledWith({
                label: 'Option English',
                languageId: englishLanguage._id,
                optionId: createdOption._id
            });

            expect(OptionTranslation.create).toHaveBeenCalledWith({
                label: 'Option French',
                languageId: frenchLanguage._id,
                optionId: createdOption._id
            });

            expect(result).toEqual(createdOption);
        });

        it('should throw an error if creation fails', async () => {
            const payload = { value: 10, isItImportant: true };
            const translations = [
                { isoCode: 'en', label: 'Option English' }
            ];

            const error = new Error('Creation failed');
            Option.create.mockRejectedValue(error);

            await expect(optionRepository.create(payload, translations)).rejects.toThrow('Creation failed');
        });
    });

    describe('getAllByIsoCodeLanguage', () => {
        it('should return options categorized by importance for the given language', async () => {
            const options = [
                { _id: '1', label: 'Option 1', value: 10, isItImportant: true, createdAt: new Date() },
                { _id: '2', label: 'Option 2', value: 20, isItImportant: false, createdAt: new Date() }
            ];

            const language = { _id: 'langId', isoCode: 'en', label: 'English' };
            const optionTranslation1 = { label: 'Option 1 Translated', optionId: '1', languageId: 'langId' };
            const optionTranslation2 = { label: 'Option 2 Translated', optionId: '2', languageId: 'langId' };

            // Mocking the chainable find and sort methods
            const mockSort = jest.fn().mockResolvedValue(options);
            Option.find.mockReturnValue({ sort: mockSort });
            Language.findOne.mockResolvedValue(language);
            OptionTranslation.findOne
                .mockResolvedValueOnce(optionTranslation1)
                .mockResolvedValueOnce(optionTranslation2);

            const result = await optionRepository.getAllByIsoCodeLanguage('en');

            expect(Option.find).toHaveBeenCalled();
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(Language.findOne).toHaveBeenCalledWith({ isoCode: 'en' });

            expect(OptionTranslation.findOne).toHaveBeenCalledWith({ optionId: '1', languageId: language._id });
            expect(OptionTranslation.findOne).toHaveBeenCalledWith({ optionId: '2', languageId: language._id });

            expect(result).toEqual({
                optionsImportant: [
                    { ...options[0], label: 'Option 1 Translated' }
                ],
                optionsNotImportant: [
                    { ...options[1], label: 'Option 2 Translated' }
                ]
            });
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetch failed');

            // Mocking the chainable find and sort methods to throw an error
            const mockSort = jest.fn().mockRejectedValue(error);
            Option.find.mockReturnValue({ sort: mockSort });

            await expect(optionRepository.getAllByIsoCodeLanguage('en')).rejects.toThrow('Fetch failed');
        });
    });
});
