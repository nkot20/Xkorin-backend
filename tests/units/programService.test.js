// programService.test.js
const mongoose = require('mongoose');
const ProgramService = require('../../services/ProgramService');
const programRepository = require('../../repositories/ProgramRepository');
const institutionService = require('../../services/InstitutionService');
const INSTITUTIONNAME = require('../../config/institution');

jest.mock('../../repositories/ProgramRepository');
jest.mock('../../services/InstitutionService');

describe('ProgramService', () => {
    test('create should save a new program', async () => {
        const payload = { name: 'New Program', targetInstitutionId: 'someInstitutionId' };
        const institution = { _id: 'someInstitutionId' };

        institutionService.getInstitutionByName.mockResolvedValue(institution);
        programRepository.findOneByName.mockResolvedValue(null);
        programRepository.save.mockResolvedValue(payload);

        const result = await ProgramService.create(payload);
        expect(result).toBe(payload);
    });

    test('create should use default institution ID when targetInstitutionId is "nothing"', async () => {
        const payload = { name: 'New Program', targetInstitutionId: 'nothing' };
        const institution = { _id: 'defaultInstitutionId' };

        institutionService.getInstitutionByName.mockResolvedValue(institution);
        programRepository.findOneByName.mockResolvedValue(null);
        programRepository.save.mockResolvedValue(payload);

        const result = await ProgramService.create(payload);
        expect(result).toBe(payload);
    });

    test('create should throw an error if program already exists', async () => {
        const payload = { name: 'Existing Program' };

        programRepository.findOneByName.mockResolvedValue(payload);

        await expect(ProgramService.create(payload)).rejects.toThrow('Program already exists');
    });

    test('update should call updateOne on repository', async () => {
        const id = 'programId';
        const payload = { name: 'Updated Program' };

        programRepository.updateOne.mockResolvedValue(payload);

        const result = await ProgramService.update(id, payload);

        expect(programRepository.updateOne).toHaveBeenCalledWith(id, payload);
        expect(result).toBe(payload);
    });

    test('getAll should return all programs', async () => {
        const programs = [{ name: 'Program 1' }, { name: 'Program 2' }];

        programRepository.find.mockResolvedValue(programs);

        const result = await ProgramService.getAll();

        expect(programRepository.find).toHaveBeenCalled();
        expect(result).toBe(programs);
    });

    test('getByName should return program by name', async () => {
        const name = 'Program Name';
        const program = { name };

        programRepository.findOneByName.mockResolvedValue(program);

        const result = await ProgramService.getByName(name);

        expect(programRepository.findOneByName).toHaveBeenCalledWith(name);
        expect(result).toBe(program);
    });

    test('getById should return program by id', async () => {
        const id = 'programId';
        const program = { _id: id };

        programRepository.findById.mockResolvedValue(program);

        const result = await ProgramService.getById(id);

        expect(programRepository.findById).toHaveBeenCalledWith(id);
        expect(result).toBe(program);
    });

    test('listProgramsByInstitutionWithoutPagination should return programs by institution', async () => {
        const institutionId = 'institutionId';
        const programs = [{ name: 'Program 1' }, { name: 'Program 2' }];

        programRepository.findByInstitutionWithoutPagination.mockResolvedValue(programs);

        const result = await ProgramService.listProgramsByInstitutionWithoutPagination(institutionId);

        expect(programRepository.findByInstitutionWithoutPagination).toHaveBeenCalledWith(institutionId);
        expect(result).toBe(programs);
    });

    test('listProgramsByInstitution should return paginated programs by institution', async () => {
        const institutionId = '668ff3709ccb48e2154b4093';
        const options = { search: 'Program' };
        const programs = [{ name: 'Program 1', targetName: 'Institution 1' }];

        programRepository.aggregatePaginate.mockResolvedValue(programs);

        const result = await ProgramService.listProgramsByInstitution(institutionId, options);

        expect(result).toBe(programs);
    });

    test('archivedProgram should call archiveProgram on repository', async () => {
        const id = 'programId';
        const result = { success: true };

        programRepository.archiveProgram.mockResolvedValue(result);

        const response = await ProgramService.archivedProgram(id);

        expect(programRepository.archiveProgram).toHaveBeenCalledWith(id);
        expect(response).toBe(result);
    });
});
