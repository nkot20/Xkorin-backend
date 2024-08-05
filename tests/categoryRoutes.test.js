const request = require('supertest');
const express = require('express');
const router = require('../routes/front-office/Category');
const categoryRepository = require('../repositories/CategoryRepository');

jest.mock('../repositories/CategoryRepository');

const app = express();
app.use(express.json());
app.use('/api/category', router);

describe('Category Routes', () => {
    describe('POST /create', () => {
        it('Create category and retrun it', async () => {
            const isoCode = 'en';
            const categories = [
                { _id: 'categoryId123', label: 'Test label', type: 'Financing' }
            ];
            categoryRepository.getAllByLangage = jest.fn().mockResolvedValue(categories)
            const response = await request(app).get(`/api/category/${isoCode}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { _id: 'categoryId123', label: 'Test label', type: 'Financing' }
            ]);
        })
    })
    describe('GET /:isoCode', () => {
        it('Get all categories according to iso code language', async () => {
            const isoCode = 'en';
            const categories = [
                { _id: 'categoryId123', label: 'Test label', type: 'Financing' }
            ];
            categoryRepository.getAllByLangage = jest.fn().mockResolvedValue(categories)
            const response = await request(app).get(`/api/category/${isoCode}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { _id: 'categoryId123', label: 'Test label', type: 'Financing' }
            ]);
        })
    })
})