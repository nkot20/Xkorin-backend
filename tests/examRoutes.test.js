const request = require('supertest');
const express = require('express');
const router = require('../routes/front-office/Exam/exam.routes');
const examRepository = require('../repositories/ExamRepository');
const imprintRepository = require('../repositories/ImprintRepository');

jest.mock('../repositories/ExamRepository');
jest.mock('../repositories/ImprintRepository');

const app = express();
app.use(express.json());
app.use('/api/exams', router);

describe('Exam Routes', () => {
    describe('POST /create', () => {
        it('should create a new exam and return it', async () => {
            const newExam = {
                personId: 'personId123',
                aim: 'Financing',
                amount: 100,
                programId: 'programId123',
            };

            examRepository.create = jest.fn().mockResolvedValue(newExam);

            const response = await request(app)
                .post('/api/exams/create')
                .send(newExam);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(newExam);
        });

    });

    describe('GET /:personId', () => {
        it('should return exams for a specific person', async () => {
            const personId = 'personId123';
            const exams = [
                { exam: { _id: 'examId123', aim: 'Test Aim' } }
            ];

            examRepository.getExamByPersonId = jest.fn().mockResolvedValue(exams);
            imprintRepository.getAvailableExam = jest.fn().mockResolvedValue([]);

            const response = await request(app).get(`/api/exams/${personId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { exam: { _id: 'examId123', aim: 'Test Aim' }, indiceAvailable: [] }
            ]);
        });
    });

    describe('GET /details/:examId', () => {
        it('should return details of an exam by ID', async () => {
            const examId = 'examId123';
            const examDetails = {
                exam: { _id: 'examId123', aim: 'Test Aim' },
                person: { name: 'John Doe' },
                company: { name: 'Acme Inc.' },
                institution: { name: 'Institution X' }
            };

            examRepository.getExamById = jest.fn().mockResolvedValue(examDetails);

            const response = await request(app).get(`/api/exams/details/${examId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(examDetails);
        });
    });
});
