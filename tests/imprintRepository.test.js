const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const imprintRepository = require('../repositories/ImprintRepository');
const Imprint = require('../models/Imprint');
const Variable = require('../models/Variable');
const Question = require('../models/Question');
const Language = require('../models/Language');
const VariableTranslation = require('../models/VariableTranslation');
const QuestionTranslation = require('../models/QuestionTranslation');
const ExamState = require('../models/ExamState');
const subCategoryImprintService = require('../services/SubCategoryImprintService');


describe('ImprintRepository', () => {
    describe('createFootprint', () => {
        it('should create a new imprint and return it', async () => {
            const datas = { name: 'Test Imprint' };
            const result = await imprintRepository.createFootprint(datas);
            expect(result).toHaveProperty('_id');
            expect(result.name).toBe('Test Imprint');
        });

        it('should throw an error if creation fails', async () => {
            jest.spyOn(Imprint, 'create').mockImplementationOnce(() => {
                throw new Error('Creation failed');
            });

            const datas = { name: 'Test Imprint' };
            await expect(imprintRepository.createFootprint(datas)).rejects.toThrow('Creation failed');
        });
    });

    describe('getLastChildrenForOrphans', () => {
        it('should return the last children without children and their translations', async () => {
            const language = await Language.create({ isoCode: 'en', label: 'English' });
            const parentVariable = await Variable.create({ name: 'Parent Variable' });
            const childVariable = await Variable.create({ name: 'Child Variable', parent: parentVariable._id });
            await VariableTranslation.create({ label: 'Translated Child Variable', variableId: childVariable._id, languageId: language._id });

            const result = await imprintRepository.getLastChildrenForOrphans([parentVariable], language._id);
            expect(result).toEqual([{
                _id: parentVariable._id,
                name: 'Parent Variable',
                lastChildren: [{
                    _id: childVariable._id,
                    name: 'Translated Child Variable',
                }]
            }]);
        });

        it('should throw an error if fetching fails', async () => {
            jest.spyOn(Variable, 'find').mockImplementationOnce(() => {
                throw new Error('Fetch failed');
            });

            await expect(imprintRepository.getLastChildrenForOrphans([], 'en')).rejects.toThrow('An error occurred while fetching the variables.');
        });
    });

    describe('getVariablesForImprints', () => {
        it('should fetch variables and their children for imprints', async () => {
            const imprint = await Imprint.create({ name: 'Test Imprint' });
            const language = await Language.create({ isoCode: 'en', label: 'English' });
            const variable = await Variable.create({ name: 'Root Variable', imprintId: imprint._id });

            jest.spyOn(subCategoryImprintService, 'getImprintIdBySubcategoryId').mockResolvedValue([imprint._id.toString()]);

            const result = await imprintRepository.getVariablesForImprints(imprint._id.toString(), language.isoCode, '123');
            const receiveValues = [
                {
                    imprint: {_id: result[0].imprint._id, name:  result[0].imprint.name},
                    variables: [{
                        variable: { _id: result[0].variables[0].variable._id.toString(), name: result[0].variables[0].variable.name},
                        children: []
                    }]
                }
            ]
            expect(receiveValues).toEqual([{
                imprint: { _id: imprint._id,  name: 'Test Imprint', },
                variables: [{
                    variable: { _id: variable._id.toString(), name: 'Root Variable' },
                    children: []
                }]
            }]);
        });

        it('should throw an error if fetching fails', async () => {
            jest.spyOn(subCategoryImprintService, 'getImprintIdBySubcategoryId').mockRejectedValue(new Error('Fetch failed'));

            await expect(imprintRepository.getVariablesForImprints('1', 'en', '123')).rejects.toThrow('An error occurred while fetching the variables.');
        });
    });

    describe('getRemainingVariablesForImprints', () => {
        it('should fetch remaining variables for imprints', async () => {
            const imprint = await Imprint.create({ name: 'Test Imprint', number: 1 });
            const language = await Language.create({ isoCode: 'en', label: 'English' });
            const variable = await Variable.create({ name: 'Root Variable', imprintId: imprint._id });
            const childVariable = await Variable.create({ name: 'Child Variable', parent: variable._id });

            jest.spyOn(subCategoryImprintService, 'getImprintIdBySubcategoryId').mockResolvedValue([imprint._id.toString()]);
            jest.spyOn(ExamState, 'findOne').mockResolvedValue(null); // Variable is not evaluated

            const result = await imprintRepository.getRemainingVariablesForImprints(imprint._id.toString(), language.isoCode, '123', 'exam1');
            console.log("getRemainingVariablesForImprints ---------------------", result)
            const receiveValues = [
                {
                    imprint: {_id: result[0].imprint._id, name:  result[0].imprint.name},
                    variables: [{
                        variable: { _id: result[0].variables[0].variable._id.toString(), name: result[0].variables[0].variable.name},
                        children: []
                    }]
                }
            ]
            expect(receiveValues).toEqual([{
                imprint: { _id: imprint._id.toString(), number: 1 },
                variables: [{
                    variable: { _id: variable._id.toString(), name: 'Root Variable' },
                    children: []
                }]
            }]);
        });

        it('should throw an error if fetching fails', async () => {
            jest.spyOn(subCategoryImprintService, 'getImprintIdBySubcategoryId').mockRejectedValue(new Error('An error occurred while fetching the remaining variables.'));

            await expect(imprintRepository.getRemainingVariablesForImprints('1', 'en', '123', 'exam1')).rejects.toThrow('An error occurred while fetching the remaining variables.');
        });
    });
});
