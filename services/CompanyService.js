const CompanyRepository = require('../repositories/CompanyRepository');
const Exam = require('../models/Exam');
const Person = require('../models/Person');

class CompanyService {
    async getAllCompanies(options) {
        try {
            return await CompanyRepository.getAll(options);
        } catch (error) {
            throw error;
        }
    }

    async getCompanyById(id) {
        try {
            const company = await CompanyRepository.getCompany(id);
            if (!company) {
                throw new Error('Company not found');
            }
            return company;
        } catch (error) {
            throw error;
        }
    }

    async getCompanyByName(name) {
        try {
            const company = await CompanyRepository.getCompanyByName(name);
            if (!company) {
                throw new Error('Company not found');
            }
            return company;
        } catch (error) {
            throw error;
        }
    }

    async createCompany(data) {
        try {
            return await CompanyRepository.createCompany(data);
        } catch (error) {
            throw error;
        }
    }

    async updateCompany(companyId, data) {
        try {
            return await CompanyRepository.updateCompany(companyId, data);
        } catch (error) {
            throw error;
        }
    }

    async getAllCompaniesWithoutPagination() {
        try {
            return await CompanyRepository.getAllWithoutPagination();
        } catch (error) {
            throw error;
        }
    }

    async getCompanyByIdUserManager(id) {
        try {
            return await CompanyRepository.getCompanyByIdUserManager(id);
        } catch (error) {
            throw error;
        }
    }

    async getCompaniesAndAdminsByInstitutionId(institutionId, page, limit, sort, order) {
        try {
            const companies = await CompanyRepository.getCompaniesAndAdminsByInstitutionId(institutionId);
            const totalCompanies = companies.length;

            return {
                companies: companies.slice((page - 1) * limit, page * limit).sort((a, b) => {
                    if (order === 'desc') {
                        return b[sort] - a[sort];
                    } else {
                        return a[sort] - b[sort];
                    }
                }),
                totalCompanies: totalCompanies,
            };
        } catch (err) {
            throw err;
        }
    }

    async getCompaniesAndAdminsByInstitutionIdWithPagination(options) {
        try {
            return await CompanyRepository.getCompaniesAndAdminsByInstitutionId2(options);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CompanyService();
