const mongoose = require('mongoose');
const InstitutionService = require('../../services/InstitutionService');
const Institution = require('../../models/Institution');
const userRepository = require('../../repositories/UserRepository');
const programService = require('../../services/ProgramService');

jest.mock('../../repositories/UserRepository');
jest.mock('../../services/ProgramService');

describe('InstitutionService', () => {
    describe('create', () => {
        it('should create and return a new institution', async () => {
            const payload = {
                name: 'Test Institution',
                email: 'test@example.com',
                status: 'Active',
                type: 'Support'
            };

            const institution = await InstitutionService.createInstitution(payload);

            expect(institution).toBeDefined();
            expect(institution.name).toBe(payload.name);
            expect(institution.email).toBe(payload.email);
            expect(institution.status).toBe(payload.status);
        });

        it('should throw an error if the institution already exists', async () => {
            const payload = {
                name: 'Test Institution',
                email: 'test@example.com',
                status: 'Active',
                type: 'Support'
            };

            await Institution.create(payload);

            await expect(InstitutionService.createInstitution(payload)).rejects.toThrow('Institution is already exist');
        });
    });

    describe('update', () => {
        it('should update an institution by ID', async () => {
            const institution = await Institution.create({
                name: 'Old Institution',
                email: 'old@example.com',
                status: 'Inactive',
                type: 'Financing'
            });

            const updatePayload = {
                name: 'Updated Institution',
                email: 'updated@example.com',
                status: 'Active'
            };

            const updatedInstitution = await InstitutionService.updateInstitution(institution._id, updatePayload);

            expect(updatedInstitution).toBeDefined();
            const fetchedInstitution = await Institution.findById(institution._id);
            expect(fetchedInstitution.name).toBe(updatePayload.name);
            expect(fetchedInstitution.email).toBe(updatePayload.email);
            expect(fetchedInstitution.status).toBe(updatePayload.status);
        });
    });

    describe('updateAfterFirstInscription', () => {
        it('should update institution, create program, and update user status', async () => {
            const institution = await Institution.create({
                name: 'Institution to Update',
                email: 'institution@example.com',
                status: 'Inactive',
                type: 'Grant'
            });

            const userId = new mongoose.Types.ObjectId();

            const updatePayload = {
                institution: {
                    name: 'Institution Updated',
                    email: 'updated@example.com',
                    status: 'Active'
                },
                program: {
                    name: 'New Program',
                    targetInstitutionId: new mongoose.Types.ObjectId()
                }
            };

            const mockProgram = { _id: new mongoose.Types.ObjectId() };
            programService.create.mockResolvedValue(mockProgram);

            const updatedInstitution = await InstitutionService.updateAfterFirstInscription(userId, institution._id, updatePayload);

            expect(updatedInstitution).toBeDefined();

            const fetchedInstitution = await Institution.findById(institution._id);
            expect(fetchedInstitution.name).toBe(updatePayload.institution.name);
            expect(fetchedInstitution.email).toBe(updatePayload.institution.email);
            expect(fetchedInstitution.status).toBe(updatePayload.institution.status);

            expect(programService.create).toHaveBeenCalledWith({
                institutionId: institution._id,
                name: updatePayload.program.name,
                targetInstitutionId: updatePayload.program.targetInstitutionId
            });

            expect(userRepository.updateUser).toHaveBeenCalledWith(userId, { alreadyLogin: true });
        });
    });

    describe('getAll', () => {
        it('should return all institutions', async () => {
            await Institution.create({ name: 'Institution 1', status: 'Active', type: 'Support' });
            await Institution.create({ name: 'Institution 2', status: 'Inactive', type: 'Financing' });

            const institutions = await InstitutionService.getAllInstitutions();

            expect(institutions).toBeDefined();
            expect(institutions.length).toBe(2);
        });
    });

    describe('getByName', () => {
        it('should return an institution by name', async () => {
            const name = 'Test Institution';
            await Institution.create({ name, status: 'Active', type: 'Support' });

            const institution = await InstitutionService.getInstitutionByName(name);

            expect(institution).toBeDefined();
            expect(institution.name).toBe(name);
        });
    });

    describe('getByType', () => {
        it('should return institutions by type', async () => {
            await Institution.create({ name: 'Institution 1', type: 'Support', status: 'Active' });
            await Institution.create({ name: 'Institution 2', type: 'Support', status: 'Inactive' });

            const institutions = await InstitutionService.getInstitutionsByType('Support');

            expect(institutions).toBeDefined();
            expect(institutions.length).toBe(2);
        });
    });

    describe('getById', () => {
        it('should return an institution by ID', async () => {
            const institution = await Institution.create({ name: 'Institution by ID', status: 'Active', type: 'Support' });

            const fetchedInstitution = await InstitutionService.getInstitutionById(institution._id);

            expect(fetchedInstitution).toBeDefined();
            expect(fetchedInstitution.name).toBe(institution.name);
        });
    });

    describe('getByAdminId', () => {
        it('should return an institution by admin ID', async () => {
            const adminId = new mongoose.Types.ObjectId();
            await Institution.create({ name: 'Institution by Admin', adminId, status: 'Active', type: 'Support' });

            const institution = await InstitutionService.getInstitutionByAdminId(adminId);

            expect(institution).toBeDefined();
            expect(institution.adminId.toString()).toBe(adminId.toString());
        });
    });

});
