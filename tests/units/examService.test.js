const mongoose = require('mongoose');
const examService = require('../../services/ExamService');
const Exam = require('../../models/Exam');
const Person = require('../../models/Person');
const Company = require('../../models/Company');
const Program = require('../../models/Program');
const Institution = require('../../models/Institution');


describe('ExamService', () => {
    describe('create', () => {
        it('should create and return a new exam', async () => {
            const person = await Person.create({ name: 'John Doe' });
            const program = await Program.create({ name: 'Test Program' });

            const payload = {
                personId: person._id,
                programId: program._id,
                aim: 'Financing',
                amount: 1000,
                audited: false
            };

            const exam = await examService.createExam(payload);
            expect(exam).toBeDefined();
            expect(exam.personId).toEqual(person._id);
            expect(exam.programId).toEqual(program._id);
            expect(exam.aim).toBe('Financing');
            expect(exam.amount).toBe(1000);
            expect(exam.audited).toBe(false);
        });
    });

    describe('getExamById', () => {
        it('should return an exam with associated person, company, and institution', async () => {
            const institution = await Institution.create({ name: 'Test Institution' });
            const program = await Program.create({ institutionId: institution._id, name: 'Test Program' });
            const company = await Company.create({ name: 'Test Company' });
            const person = await Person.create({ company_id: [company._id] });

            const exam = await Exam.create({
                personId: person._id,
                programId: program._id,
                aim: 'Support',
                amount: 500,
                audited: true
            });

            const result = await examService.getExamById(exam._id);

            expect(result).toBeDefined();
            expect(result.exam._id).toEqual(exam._id);
            expect(result.person._id).toEqual(person._id);
            expect(result.company._id).toEqual(company._id);
            expect(result.institution._id).toEqual(institution._id);
        });

        it('should throw an error if the exam does not exist', async () => {
            await expect(examService.getExamById(new mongoose.Types.ObjectId())).rejects.toThrow('Exam not found');
        });
    });

    describe('getExamByPersonId', () => {
        it('should return exams with associated program and institution', async () => {
            const institution = await Institution.create({ name: 'Test Institution' });
            const program = await Program.create({ institutionId: institution._id, name: 'Test Program' });
            const person = await Person.create({});

            await Exam.create({ personId: person._id, programId: program._id, aim: 'Upgrading', amount: 2000 });

            const exams = await examService.getExamByPersonId(person._id);

            expect(exams).toBeDefined();
            expect(exams.length).toBeGreaterThan(0);
            expect(exams[0].exam.personId).toEqual(person._id);
        });

        it('should throw an error if the person does not exist', async () => {
            await expect(examService.getExamByPersonId(new mongoose.Types.ObjectId())).rejects.toThrow("This person doesn't exist");
        });
    });

    describe('getPersonProfileByExamId', () => {
        it('should return the profile id of the person associated with the exam', async () => {
            const program = await Program.create({ institutionId: new mongoose.Types.ObjectId(), name: 'Test Program' });
            const person = await Person.create({ profil_id: new mongoose.Types.ObjectId() });
            const exam = await Exam.create({ personId: person._id, programId: program._id });

            const profileId = await examService.getPersonProfileByExamId(exam._id);



            expect(profileId).toBeDefined();
            expect(profileId).toEqual([person.profil_id[0]]);
        });

        it('should throw an error if the exam or profile is not found', async () => {
            await expect(examService.getPersonProfileByExamId(new mongoose.Types.ObjectId())).rejects.toThrow('Examen ou profil de la personne non trouvé');
        });
    });

    describe('getExamsByPersonAndInstitution', () => {
        it('should return exams based on person and institution', async () => {
            const institution = await Institution.create({ name: 'Test Institution' });
            const program = await Program.create({ institutionId: institution._id, name: 'Test Program' });
            const person = await Person.create({});
            await Exam.create({ personId: person._id, programId: program._id });

            const exams = await examService.getExamsByPersonAndInstitution(person._id, institution._id);

            expect(exams).toBeDefined();
            expect(exams.length).toBeGreaterThan(0);
        });
    });

    describe('getLatestExamByPersonAndInstitution', () => {
        it('should return the latest exam based on person and institution', async () => {
            const institution = await Institution.create({ name: 'Test Institution' });
            const program = await Program.create({ institutionId: institution._id, name: 'Test Program' });
            const person = await Person.create({});
            const olderExam = await Exam.create({ personId: person._id, programId: program._id, createdAt: new Date('2023-01-01') });
            const latestExam = await Exam.create({ personId: person._id, programId: program._id });

            const exam = await examService.getLatestExamByPersonAndInstitution(person._id, institution._id);

            expect(exam).toBeDefined();
            expect(exam._id).toEqual(latestExam._id);
        });
    });

    describe('getInstitutionByExamId', () => {
        it('should return the institution associated with the exam', async () => {
            const institution = await Institution.create({ name: 'Test Institution' });
            const program = await Program.create({ institutionId: institution._id, name: 'Test Program' });
            const person = await Person.create({});
            const exam = await Exam.create({ personId: person._id, programId: program._id });

            const result = await examService.getInstitutionByExamId(exam._id);

            expect(result).toBeDefined();
            expect(result._id).toEqual(institution._id);
        });

        it('should throw an error if the institution is not found', async () => {
            await expect(examService.getInstitutionByExamId(new mongoose.Types.ObjectId())).rejects.toThrow('Institution non trouvée pour cet examen');
        });
    });
});
