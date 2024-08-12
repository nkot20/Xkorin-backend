const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const companyService = require('../services/CompanyService');
const Company = require('../models/Company');
const request = require('supertest');
let mongoServer;

describe('CompanyRepository', () => {
    describe('getCompany', () => {
        it('should return a company by ID', async () => {
            // Créer une fausse entreprise
            const mockCompany = new Company({
                name: 'Test Company',
                email: 'test@company.com',
                status: 'Active',
            });

            await mockCompany.save();

            const company = await companyService.getCompanyById(mockCompany._id);

            expect(company).toBeDefined();
            expect(company.name).toBe('Test Company');
            expect(company.email).toBe('test@company.com');
        });

        it('should return null if the company does not exist', async () => {
            await expect(companyService.getCompanyById(mongoose.Types.ObjectId()))
                .rejects
                .toThrow('Company not found');
        });
    });

    describe('createCompany', () => {
        it('should create and save a new company', async () => {
            const data = {
                name: 'New Company',
                email: 'new@company.com',
                status: 'Active',
            };

            const newCompany = await companyService.createCompany(data);

            expect(newCompany).toBeDefined();
            expect(newCompany.name).toBe('New Company');
            expect(newCompany.email).toBe('new@company.com');
        });
    });

    describe('getAll', () => {
        it('should return all companies matching the search criteria', async () => {
            // Créer des entreprises pour les tests
            await Company.create([
                { name: 'Company One', email: 'one@company.com', status: 'Active' },
                { name: 'Company Two', email: 'two@company.com', status: 'Inactive' },
            ]);

            const options = {
                search: 'Company',
                sortBy: 'name',
                sortDirection: 1,
                limit: 10,
                page: 1,
            };

            const companies = await companyService.getAllCompanies(options);
            expect(companies).toBeDefined();
            expect(companies.docs.length).toBe(2);
        });
    });

    describe('updateCompany', () => {
        it('should update the company with the given data', async () => {
            // Créer une fausse entreprise
            const mockCompany = new Company({
                name: 'Old Company Name',
                email: 'old@company.com',
                status: 'Active',
            });

            await mockCompany.save();

            const updatedData = { name: 'Updated Company Name' };
            const updatedCompany = await companyService.updateCompany(mockCompany._id, updatedData);

            expect(updatedCompany).toBeDefined();
            expect(updatedCompany.name).toBe('Updated Company Name');
        });
    });
});
