const request = require('supertest');
const express = require('express');
const examRoutes = require('../../../routes/front-office/Exam');
const examService = require('../../../services/ExamService');
const imprintRepository = require('../../../repositories/ImprintRepository');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

jest.mock('../../../services/ExamService');
jest.mock('../../../repositories/ImprintRepository');
jest.mock('../../../middlewares/authenticate.middleware', () => ({
    authenticate: jest.fn((req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Authorization required' });
        }
        req.user = { id: 'user123' };
        next();
    }),
}));

const app = express();
app.use(express.json());
app.use('/exams', examRoutes);

describe('Exam Routes', () => {
    let token;

    beforeEach(() => {
        token = 'Bearer mockToken';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /exams/create', () => {
        it('should create a new exam and return 201 status', async () => {
            const mockRequestBody = {
                personId: 'person1',
                aim: 'Certification',
                amount: 100,
                programId: 'program1'
            };

            const mockResponseBody = { id: 'exam1', ...mockRequestBody };

            examService.createExam.mockResolvedValue(mockResponseBody);

            const response = await request(app)
                .post('/exams/create')
                .set('Authorization', token)
                .send(mockRequestBody);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponseBody);
            expect(examService.createExam).toHaveBeenCalledWith(mockRequestBody);
        });
        it('should return 401 if no token is provided', async () => {
            const mockRequestBody = {
                personId: 'person1',
                aim: 'Certification',
                amount: 100,
                programId: 'program1'
            };

            const response = await request(app)
                .post('/exams/create')
                .send(mockRequestBody);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Authorization required');
        });
    });

    describe('GET /exams/:personId', () => {
        it('should get all exams for a specific person', async () => {
            const personId = 'person1';
            const mockExams = [
                { exam: { id: 'exam1', name: 'Exam 1' }, indiceAvailable: 3 },
                { exam: { id: 'exam2', name: 'Exam 2' }, indiceAvailable: 3 }
            ];

            examService.getExamByPersonId.mockResolvedValue(mockExams);

            imprintRepository.getAvailableExam.mockImplementation(async (examId) => {
                return examId === 'exam1' ? 5 : 3;
            });

            const response = await request(app)
                .get(`/exams/${personId}`)
                .set('Authorization', token);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockExams);
            expect(examService.getExamByPersonId).toHaveBeenCalledWith(personId);
        });

        it('should return 401 if no token is provided', async () => {
            const personId = 'person1';

            const response = await request(app)
                .get(`/exams/${personId}`);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Authorization required');
        });
    });

    describe('GET /exams/details/:examId', () => {
        it('should get details of an exam by ID', async () => {
            const examId = 'exam1';
            const mockResponse = { id: examId, name: 'Exam 1', details: 'Detailed information' };

            examService.getExamById.mockResolvedValue(mockResponse);

            const response = await request(app)
                .get(`/exams/details/${examId}`)
                .set('Authorization', token);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(examService.getExamById).toHaveBeenCalledWith(examId);
        });

        it('should return 401 if no token is provided', async () => {
            const examId = 'exam1';

            const response = await request(app)
                .get(`/exams/details/${examId}`);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Authorization required');
        });
    });

    describe('GET /exams/all/:institutionId', () => {
        it('should get all exams by institution ID', async () => {
            const institutionId = 'institution1';
            const mockResponse = [
                { id: 'exam1', name: 'Exam 1' },
                { id: 'exam2', name: 'Exam 2' }
            ];

            examService.getExamByInstitution.mockResolvedValue(mockResponse);

            const response = await request(app)
                .get(`/exams/all/${institutionId}`)
                .set('Authorization', token);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(examService.getExamByInstitution).toHaveBeenCalledWith(institutionId);
        });

        it('should return 401 if no token is provided', async () => {
            const institutionId = 'institution1';

            const response = await request(app)
                .get(`/exams/all/${institutionId}`);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Authorization required');
        });
    });
});
