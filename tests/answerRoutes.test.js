const request = require('supertest');
const express = require('express');
const router = require('../routes/front-office/Answer/answer.routes'); // Mettez le bon chemin vers votre fichier de route
const answerRepository = require('../repositories/AnswerRepository');

jest.mock('../repositories/AnswerRepository');

const app = express();
app.use(express.json());
app.use('/api/answer', router);

describe('Answer Routes', () => {
    describe('POST /create', () => {
        it('should create a new answers and return them', async () => {
            const answers = [
                {
                    questionId: "questionId123",
                    optionId: "optionId123",
                    examId: "examId123"
                },
                {
                    questionId: "questionId1234",
                    optionId: "optionId1234",
                    examId: "examId123"
                },
            ]
            answerRepository.create = jest.fn().mockResolvedValue(answers);
            const response = await request(app)
                .post("/api/answer/create")
                .send(answers);
            expect(response.status).toBe(201)
            expect(response.body).toEqual(answers);

        });
    });
});