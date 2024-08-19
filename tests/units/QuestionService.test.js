// tests/QuestionService.test.js
const QuestionService = require('../../services/QuestionService');
const QuestionRepository = require('../../repositories/QuestionRepository');
const variableRepository = require('../../repositories/VariableRepository');
const profilService = require('../../services/ProfilService');

jest.mock('../../repositories/QuestionRepository', () => ({
    createQuestion: jest.fn(),
    createQuestionTranslation: jest.fn(),
    findLanguageByIsoCode: jest.fn(),
    findQuestionsByVariableId: jest.fn(),
    findQuestionTranslations: jest.fn(),
    findPropositionsByQuestionId: jest.fn(),
    findPropositionTranslations: jest.fn(),
}));

jest.mock('../../repositories/VariableRepository', () => ({
    getVariableById: jest.fn(),
}));

jest.mock('../../services/ProfilService', () => ({
    getProfilById: jest.fn(),
}));


describe('QuestionService', () => {

    describe('createQuestionWithTranslations', () => {
        it('should create questions with translations and throw error if no English translation is found', async () => {
            const variableId = 'variable123';
            const questions = [
                { label: 'Label en anglais', isoCode: 'en' },
                { label: 'Étiquette en français', isoCode: 'fr' }
            ];
            const datas = {
                profils: ['profil1', 'profil2'],
                weighting: true
            };

            QuestionRepository.createQuestion.mockResolvedValue({ _id: 'question123' });
            QuestionRepository.findLanguageByIsoCode.mockResolvedValue({ _id: 'language123' });
            QuestionRepository.createQuestionTranslation.mockResolvedValue({});

            const createdQuestions = await QuestionService.createQuestionWithTranslations(variableId, questions, datas);

            expect(QuestionRepository.createQuestion).toHaveBeenCalledTimes(2); // Called for each profil
            expect(QuestionRepository.createQuestionTranslation).toHaveBeenCalledTimes(4); // 2 profils * 2 translations (en + fr)
            expect(createdQuestions).toHaveLength(2);
        });

        it('should throw an error if no English translation is provided', async () => {
            const variableId = 'variable123';
            const questions = [{ label: 'Étiquette en français', isoCode: 'fr' }];
            const datas = {
                profils: ['profil1'],
                weighting: true
            };

            await expect(QuestionService.createQuestionWithTranslations(variableId, questions, datas))
                .rejects
                .toThrow('English translation is required');
        });
    });

    describe('retrieveQuestionFromAVariable', () => {
        it('should retrieve questions with their translations and profile', async () => {
            const variableId = 'variable123';
            const variable = { _id: 'variable123', name: 'Variable Name' };
            const questions = [
                { _id: 'question123', profilId: 'profil1', weighting: false },
                { _id: 'question124', profilId: 'profil2', weighting: true }
            ];

            variableRepository.getVariableById.mockResolvedValue(variable);
            QuestionRepository.findQuestionsByVariableId.mockResolvedValue(questions);
            profilService.getProfilById.mockResolvedValue({ _id: 'profil1', name: 'Profil 1' });
            QuestionRepository.findQuestionTranslations.mockResolvedValue([
                { label: 'Label en anglais' },
                { label: 'Étiquette en français' }
            ]);
            QuestionRepository.findPropositionsByQuestionId.mockResolvedValue([
                { _id: 'prop1', label: 'Proposition 1' }
            ]);
            QuestionRepository.findPropositionTranslations.mockResolvedValue([
                { label: 'Proposition en anglais' }
            ]);

            const response = await QuestionService.retrieveQuestionFromAVariable(variableId);

            expect(variableRepository.getVariableById).toHaveBeenCalledWith(variableId);
            expect(QuestionRepository.findQuestionsByVariableId).toHaveBeenCalledWith(variableId);
            expect(profilService.getProfilById).toHaveBeenCalledTimes(2);
            expect(response.variable).toEqual(variable);
            expect(response.questions).toHaveLength(2);
        });

        it('should return empty response if no questions are found', async () => {
            const variableId = 'variable123';
            const variable = { _id: 'variable123', name: 'Variable Name' };

            variableRepository.getVariableById.mockResolvedValue(variable);
            QuestionRepository.findQuestionsByVariableId.mockResolvedValue([]);

            const response = await QuestionService.retrieveQuestionFromAVariable(variableId);

            expect(response.variable).toEqual(variable);
            expect(response.questions).toHaveLength(0);
        });
    });
});
