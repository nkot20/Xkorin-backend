require('dotenv').config();

const Company = require('../models/Company');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Person = require('../models/Person');

class CompanyRepository {
  // List companies
  async getAll(options) {
    try {
      const regex = new RegExp(options.search, 'i');

      const aggregate = Company.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { name: regex },
                  { address: regex },
                  { email: regex },
                  { status: regex },
                  { phoneNumber: regex },
                ],
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'adminId',
            foreignField: '_id',
            as: 'admin',
          },
        },
        {
          $unwind: { path: '$admin', preserveNullAndEmptyArrays: true },
        },

        {
          $sort: {
            [options.sortBy]: options.sortDirection,
          },
        },
        {
          $project: { users: 0 },
        },
      ]);

      return await Company.aggregatePaginate(aggregate, options);
    } catch (error) {
      console.log('Get Companies error', error);
      throw error;
    }
  }

  // Get Company
  async getCompany(id) {
    try {
      // Retrieve the Company document
      const company = await Company.findById(id);

      if (!company) {
        return null;
      }

      // Retrieve all users belonging to the Company based on the companyId field
      // const users = await User.find({ business_code: Company.business_code });

      return company;
    } catch (error) {
      console.log('Get Company by Id error', error);
      throw error;
    }
  }

  async getCompanyByName(name) {
    try {
      // Retrieve the Company document
      const company = await Company.findOne({name});

      if (!company) {
        return null;
      }

      // Retrieve all users belonging to the Company based on the companyId field
      // const users = await User.find({ business_code: Company.business_code });

      return company;
    } catch (error) {
      console.log('Get Company by Id error', error);
      throw error;
    }
  }

  async createCompany(data) {
    try {
      const company = new Company(data);
      return await company.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateCompany(companyId, data) {
    try {
      return await Company.findOneAndUpdate({_id: companyId}, data, {new: true});
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllWithoutPaginnation() {
    try {
      return await Company.find().sort({name: 'asc'});
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getCompanyByIdUserManager(id) {
    try {
      return await Company.findOne({adminId: id}).exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCompaniesAndAdminsByInstitutionId(institutionId, page, limit, sort, order, search) {
    try {
      // Étape 1 : Récupérer toutes les personId à partir de l'institutionId
      const exams = await Exam.find({ institutionId: institutionId }).select('personId');

      // Récupérer les personId uniques
      const personIds = [...new Set(exams.map(exam => exam.personId))];

      // Étape 2 : Récupérer toutes les companies associées à ces personId
      const persons = await Person.find({ _id: { $in: personIds } }).select('company_id');

      // Récupérer les companyId uniques
      const companyIds = [...new Set(persons.flatMap(person => person.company_id))];

      // Étape 3 : Récupérer toutes les informations des entreprises associées à ces companyId
      const companies = await Company.find({ _id: { $in: companyIds } })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ [sort]: order === 'desc' ? -1 : 1 })
          .populate('adminId', 'name email'); // Joindre les administrateurs depuis la table users

      // Étape 4 : Compter le nombre total d'entreprises (sans pagination)
      const totalCompanies = await Company.countDocuments({ _id: { $in: companyIds } });

      return {
        companies: companies,
        totalCompanies: totalCompanies,
      };
    } catch (err) {
      console.error('Error fetching companies and admins:', err);
      throw err;
    }
  }

  async getCompaniesAndAdminsByInstitutionId2(options) {
    try {
      console.log(options)
      // Étape 1 : Récupérer toutes les personId à partir de l'institutionId
      const exams = await Exam.find({ institutionId: options.institutionId }).select('personId');

      // Récupérer les personId uniques
      const personIds = [...new Set(exams.map(exam => exam.personId))];
      console.log(personIds)

      // Étape 2 : Récupérer toutes les companies associées à ces personId
      const persons = await Person.find({ _id: { $in: personIds } }).select('company_id');

      // Récupérer les companyId uniques
      const companyIds = [...new Set(persons.flatMap(person => person.company_id))];

      // Étape 3 : Agrégation pour récupérer les entreprises paginées avec les administrateurs
      const aggregate = Company.aggregate([
        { $match: { _id: { $in: companyIds } } },
        {
          $lookup: {
            from: 'users',
            localField: 'adminId',
            foreignField: '_id',
            as: 'admin',
          },
        },
        {
          $lookup: {
            from: 'persons',
            localField: 'promoterId',
            foreignField: '_id',
            as: 'promoter',
          },
        },
      ]);

      // Options pour la pagination et le tri
      const aggregateOptions = {
        ...options,
        customLabels: { docs: 'companies', totalDocs: 'totalCompanies' },
      };

      // Ajouter une recherche par nom de l'entreprise ou nom de l'administrateur
      const searchRegex = new RegExp(options.search, 'i');
      aggregate.append({
        $match: {
          $or: [
            { name: { $regex: searchRegex } },
            { 'admin.name': { $regex: searchRegex } },
          ],
        },
      });

      return await Company.aggregatePaginate(aggregate, options);
    } catch (err) {
      console.error('Error fetching companies and admins:', err);
      throw err;
    }
  }

}

const companyRepository = new CompanyRepository();

module.exports = companyRepository;
