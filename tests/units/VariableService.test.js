const VariableService = require('../../services/VariableService');
const VariableRepository = require('../../repositories/VariableRepository');
const Language = require('../../models/Language');
const Imprint = require('../../models/Imprint');
const Weight = require('../../models/Weight');
const Option = require('../../models/Option');
const VariableTranslation = require('../../models/VariableTranslation');
const imprintInstitutionService = require('../../services/ImprintInstitutionService');

jest.mock('../../repositories/VariableRepository');
jest.mock('../../models/Language');
jest.mock('../../models/Weight');
jest.mock('../../models/Imprint');
jest.mock('../../models/Option');
jest.mock('../../models/VariableTranslation');
jest.mock('../../services/ImprintInstitutionService');
jest.mock('puppeteer', () => {
    return {
        launch: jest.fn().mockResolvedValue({
            newPage: jest.fn().mockResolvedValue({
                goto: jest.fn(),
                pdf: jest.fn().mockResolvedValue(Buffer.from('PDF Buffer')),
                close: jest.fn(),
            }),
            close: jest.fn(),
        }),
    };
});


describe('VariableService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createVariable', () => {
        it('should create a variable and translations', async () => {
            const datas = { someData: 'data' };
            const names = [{ isoCode: 'en', name: 'English Name' }];
            const problems = [{ isoCode: 'en', problem: 'English Problem' }];

            VariableRepository.create.mockResolvedValue({ _id: 'variableId' });
            VariableRepository.createTranslation.mockResolvedValue();

            const result = await VariableService.createVariable(datas, names, problems);

            expect(VariableRepository.create).toHaveBeenCalledWith({
                someData: 'data',
                name: 'English Name',
                problem: 'English Problem',
            });
            expect(result).toEqual({ _id: 'variableId' });
        });

        it('should throw an error if English name is missing', async () => {
            const datas = { someData: 'data' };
            const names = [{ isoCode: 'fr', name: 'French Name' }];
            const problems = [{ isoCode: 'en', problem: 'English Problem' }];

            await expect(VariableService.createVariable(datas, names, problems)).rejects.toThrow('English name and problem are required');
        });
    });

    describe('removeVariable', () => {
        it('should remove a variable and update related data', async () => {
            VariableRepository.findByIdAndDelete.mockResolvedValue();
            VariableRepository.updateOne.mockResolvedValue();
            Imprint.updateMany.mockResolvedValue();

            await VariableService.removeVariable('variableId');

            expect(VariableRepository.findByIdAndDelete).toHaveBeenCalledWith('variableId');
            expect(VariableRepository.updateOne).toHaveBeenCalled();
            expect(Imprint.updateMany).toHaveBeenCalled();
        });
    });

    describe('updateVariable', () => {
        it('should update a variable and translations', async () => {
            const datas = { someData: 'data', isFactor: true };
            const definitions = [{ isoCode: 'en', label: 'English Definition' }];
            const names = [{ isoCode: 'en', name: 'English Name' }];
            const problems = [{ isoCode: 'en', problem: 'English Problem' }];

            VariableRepository.updateOne.mockResolvedValue({ _id: 'variableId' });
            VariableRepository.findTranslation.mockResolvedValue([]);
            Language.findOne.mockResolvedValue({ _id: 'languageId' });

            const result = await VariableService.updateVariable('variableId', datas, definitions, names, problems);

            expect(VariableRepository.updateOne).toHaveBeenCalledWith({ _id: 'variableId' }, {
                someData: 'data',
                name: 'English Name',
                definition: 'English Definition',
                isFactor: true,
            });
            expect(result).toEqual({ _id: 'variableId' });
        });

        it('should throw an error if English name is missing during update', async () => {
            const datas = { someData: 'data' };
            const definitions = [];
            const names = [{ isoCode: 'fr', name: 'French Name' }];
            const problems = [];

            await expect(VariableService.updateVariable('variableId', datas, definitions, names, problems)).rejects.toThrow('English name is required');
        });
    });

    describe('getVariableById', () => {
        it('should return variable with names, definitions, and problems', async () => {
            VariableRepository.findById.mockResolvedValue({ _id: 'variableId', name: 'Variable Name' });
            Language.find.mockResolvedValue([{ isoCode: 'en' }]);
            VariableService.getTranslation = jest.fn()
                .mockResolvedValueOnce([{ isoCode: 'en', label: 'Name Translation' }])
                .mockResolvedValueOnce([{ isoCode: 'en', label: 'Definition Translation' }])
                .mockResolvedValueOnce([{ isoCode: 'en', label: 'Problem Translation' }]);

            const result = await VariableService.getVariableById('variableId');

            expect(VariableRepository.findById).toHaveBeenCalledWith('variableId');
            expect(result).toEqual({
                variable: { _id: 'variableId', name: 'Variable Name' },
                names: [{ isoCode: 'en', label: 'Name Translation' }],
                definitions: [{ isoCode: 'en', label: 'Definition Translation' }],
                problems: [{ isoCode: 'en', label: 'Problem Translation' }],
            });
        });

        it('should throw an error if variable is not found', async () => {
            VariableRepository.findById.mockResolvedValue(null);

            await expect(VariableService.getVariableById('variableId')).rejects.toThrow('Variable not found');
        });
    });

    /*describe('getLeafVariablesGroupedByImprints', () => {
        it('should return leaf variables grouped by imprints', async () => {
            Language.findOne.mockResolvedValue({ _id: 'languageId' });
            Option.findOne.mockResolvedValue({ _id: 'defaultOptionId' });
            imprintInstitutionService.getImprintsByInstitution.mockResolvedValue([{ imprintId: 'imprintId', name: 'Imprint Name' }]);
            Imprint.findById.mockResolvedValue({ number: 1 });
            VariableRepository.findByImprintId.mockResolvedValue([{ _id: 'variableId', name: 'Variable Name' }]);
            Weight.findOne.mockResolvedValue({ optionId: 'weightOptionId' });
            VariableTranslation.findOne.mockResolvedValue({ label: 'Variable Translation' });

            const result = await VariableService.getLeafVariablesGroupedByImprints('institutionId', 'en');

            expect(Language.findOne).toHaveBeenCalledWith({ isoCode: 'en' });
            expect(Option.findOne).toHaveBeenCalledWith({ value: 7, isItImportant: true });
            expect(imprintInstitutionService.getImprintsByInstitution).toHaveBeenCalledWith('institutionId');
            expect(result).toEqual([
                {
                    _id: 'imprintId',
                    name: 'Imprint Name',
                    status: undefined,
                    isAddedForAnInstitution: undefined,
                    number: 1,
                    variables: [{ _id: 'variableId', name: 'Variable Translation', weight: 'weightOptionId' }]
                }
            ]);
        });

        it('should throw an error if language is not found', async () => {
            Language.findOne.mockResolvedValue(null);

            await expect(VariableService.getLeafVariablesGroupedByImprints('institutionId', 'en')).rejects.toThrow('Language not found');
        });
    });*/
});
