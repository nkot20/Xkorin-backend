const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../../../routes/front-office/Category');
const categoryService = require('../../../services/CategoryService');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

jest.mock('../../../services/CategoryService');
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
app.use('/categories', categoryRoutes);

describe('GET /categories/:isoCode', () => {
    let token;

    beforeEach(() => {
        token = 'Bearer mockToken';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all categories for a given language ISO code and return 200 status', async () => {
        const isoCode = 'en';
        const mockResponseBody = [
            { id: '1', name: 'Category 1', translations: [{ language: 'en', name: 'Category 1' }] },
            { id: '2', name: 'Category 2', translations: [{ language: 'en', name: 'Category 2' }] },
        ];

        categoryService.getAllCategoriesByLanguage.mockResolvedValue(mockResponseBody);

        const response = await request(app)
            .get(`/categories/${isoCode}`)
            .set('Authorization', token);  // Set the Authorization header

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponseBody);
        expect(categoryService.getAllCategoriesByLanguage).toHaveBeenCalledWith(isoCode);
    });

    it('should return 401 if no token is provided', async () => {
        const isoCode = 'en';

        // Do not set the Authorization header for this test
        const response = await request(app)
            .get(`/categories/${isoCode}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Authorization required');
    });

});
