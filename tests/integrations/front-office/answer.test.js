const request = require('supertest');
const express = require('express');
const answerRoutes = require('../../../routes/front-office/Answer');
const answerService = require('../../../services/AnswerService');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

jest.mock('../../../services/AnswerService');
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
app.use('/answers', answerRoutes);

describe('POST /answers/create', () => {
    let token;

    beforeEach(() => {
        token = 'Bearer mockToken';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create answers and return 201 status', async () => {
        const mockRequestBody = [
            { questionId: 'q1', optionId: 'o1', examId: 'e1' },
            { questionId: 'q2', optionId: 'o2', examId: 'e1' },
        ];

        const mockResponseBody = [
            { questionId: 'q1', optionId: 'o1', examId: 'e1' },
            { questionId: 'q2', optionId: 'o2', examId: 'e1' },
        ];

        answerService.create.mockResolvedValue(mockResponseBody);

        const response = await request(app)
            .post('/answers/create')
            .set('Authorization', token)  // Set the Authorization header
            .send(mockRequestBody);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockResponseBody);
        expect(answerService.create).toHaveBeenCalledWith(mockRequestBody);
    });

    it('should return 400 if validation fails', async () => {
        const invalidRequestBody = [
            { questionId: 'q1', optionId: 'o1' }, // Missing examId
        ];

        const response = await request(app)
            .post('/answers/create')
            .set('Authorization', token)  // Set the Authorization header
            .send(invalidRequestBody);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBeInstanceOf(Array);
        expect(response.body.error[0]).toHaveProperty('message', '"[0].examId" is required');
    });

    it('should return 401 if no token is provided', async () => {
        const mockRequestBody = [
            { questionId: 'q1', optionId: 'o1', examId: 'e1' },
        ];

        // Do not set the Authorization header for this test
        const response = await request(app)
            .post('/answers/create')
            .send(mockRequestBody);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Authorization required');
    });

});
