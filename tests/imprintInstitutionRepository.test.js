const mongoose = require('mongoose');
const ImprintInstitutionRepository = require('../repositories/ImprintInstitutionRepository');
const ImprintInstitution = require('../models/ImprintInstitution');
const Imprint = require('../models/Imprint');

describe('ImprintInstitutionRepository', () => {
    describe('create', () => {
        it('should create and return a new imprint institution relation', async () => {
            const payload = {
                imprintId: new mongoose.Types.ObjectId(),
                institutionId: new mongoose.Types.ObjectId(),
                status: 'Able',
                isAddedForAnInstitution: true
            };

            const imprintInstitution = await ImprintInstitutionRepository.create(payload);

            expect(imprintInstitution).toBeDefined();
            expect(imprintInstitution.imprintId).toEqual(payload.imprintId);
            expect(imprintInstitution.institutionId).toEqual(payload.institutionId);
            expect(imprintInstitution.status).toBe('Able');
            expect(imprintInstitution.isAddedForAnInstitution).toBe(true);
        });
    });

    describe('getImprintsByInstitution', () => {
        it('should return imprints associated with the specified institution', async () => {
            const institutionId = new mongoose.Types.ObjectId();

            const imprint1 = await Imprint.create({ name: 'Imprint 1' });
            const imprint2 = await Imprint.create({ name: 'Imprint 2' });
            const imprint3 = await Imprint.create({ name: 'Imprint 3' });

            await ImprintInstitution.create({
                imprintId: imprint1._id,
                institutionId: institutionId,
                status: 'Able',
                isAddedForAnInstitution: true
            });

            await ImprintInstitution.create({
                imprintId: imprint2._id,
                institutionId: institutionId,
                status: 'Enable',
                isAddedForAnInstitution: true
            });

            const imprints = await ImprintInstitutionRepository.getImprintsByInstitution(institutionId);

            expect(imprints).toBeDefined();
            expect(imprints.length).toBe(3);

            const imprintNames = imprints.map(i => i.name);
            expect(imprintNames).toContain('Imprint 1');
            expect(imprintNames).toContain('Imprint 2');
            expect(imprintNames).toContain('Imprint 3');
        });

        it('should return imprints with default status if not linked to the institution', async () => {
            const institutionId = new mongoose.Types.ObjectId();

            const imprint1 = await Imprint.create({ name: 'Imprint 1' });

            const imprints = await ImprintInstitutionRepository.getImprintsByInstitution(institutionId);

            expect(imprints).toBeDefined();
            expect(imprints.length).toBe(1);
            expect(imprints[0].name).toBe('Imprint 1');
            expect(imprints[0].status).toBe('Able'); // Par défaut si non associé
        });

        it('should throw an error if the institutionId is invalid', async () => {
            await expect(ImprintInstitutionRepository.getImprintsByInstitution('invalidId')).rejects.toThrow();
        });
    });
});
