const request = require('supertest');
const express = require('express');
const companyRoutes = require('../../../routes/front-office/Company');
const companyRepository = require('../../../repositories/CompanyRepository');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

jest.mock('../../../repositories/CompanyRepository');
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
app.use('/companies', companyRoutes);

describe('GET /companies/:institutionId/all', () => {
    let token;

    beforeEach(() => {
        token = 'Bearer mockToken';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return companies and pagination info for a valid institution ID', async () => {
        const institutionId = 'inst123';
        const mockResponseBody = {
            docs: [
                { id: 'company1', name: 'Company 1', admin: { id: 'admin1', name: 'Admin 1' } },
                { id: 'company2', name: 'Company 2', admin: { id: 'admin2', name: 'Admin 2' } },
            ],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            nextPage: null,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 2,
            totalPages: 1,
        };

        companyRepository.getCompaniesAndAdminsByInstitutionId2.mockResolvedValue(mockResponseBody);

        const response = await request(app)
            .get(`/companies/${institutionId}/all`)
            .set('Authorization', token)
            .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.companies).toEqual(mockResponseBody.docs);
        expect(response.body.pagination).toEqual({
            hasNextPage: mockResponseBody.hasNextPage,
            hasPrevPage: mockResponseBody.hasPrevPage,
            limit: mockResponseBody.limit,
            nextPage: mockResponseBody.nextPage,
            page: mockResponseBody.page - 1, // Adjusted page index
            pagingCounter: mockResponseBody.pagingCounter,
            prevPage: mockResponseBody.prevPage,
            totalDocs: mockResponseBody.totalDocs,
            totalPages: mockResponseBody.totalPages,
        });
        expect(companyRepository.getCompaniesAndAdminsByInstitutionId2).toHaveBeenCalledWith({
            institutionId,
            page: 1,
            limit: 10,
            search: '',
            sortDirection: 1,
            sortBy: 'createdAt',
        });
    });

    it('should return 401 if no token is provided', async () => {
        const institutionId = 'inst123';

        // Do not set the Authorization header for this test
        const response = await request(app)
            .get(`/companies/${institutionId}/all`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Authorization required');
    });

    it('should return 200 with empty results if no companies are found', async () => {
        const institutionId = 'inst123';
        const mockResponseBody = {
            docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            nextPage: null,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 0,
            totalPages: 1,
        };

        companyRepository.getCompaniesAndAdminsByInstitutionId2.mockResolvedValue(mockResponseBody);

        const response = await request(app)
            .get(`/companies/${institutionId}/all`)
            .set('Authorization', token)
            .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.companies).toEqual(mockResponseBody.docs);
        expect(response.body.pagination).toEqual({
            hasNextPage: mockResponseBody.hasNextPage,
            hasPrevPage: mockResponseBody.hasPrevPage,
            limit: mockResponseBody.limit,
            nextPage: mockResponseBody.nextPage,
            page: mockResponseBody.page - 1, // Adjusted page index
            pagingCounter: mockResponseBody.pagingCounter,
            prevPage: mockResponseBody.prevPage,
            totalDocs: mockResponseBody.totalDocs,
            totalPages: mockResponseBody.totalPages,
        });
    });
});
