const Company = require('../models/Company');

class CompanyRepository {
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

  async getCompany(id) {
    try {
      return await Company.findById(id);
    } catch (error) {
      console.log('Get Company by Id error', error);
      throw error;
    }
  }

  async getCompanyByName(name) {
    try {
      return await Company.findOne({ name });
    } catch (error) {
      console.log('Get Company by Name error', error);
      throw error;
    }
  }

  async createCompany(data) {
    try {
      const company = new Company(data);
      return await company.save();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(companyId, data) {
    try {
      return await Company.findOneAndUpdate({ _id: companyId }, data, { new: true });
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  async getAllWithoutPagination() {
    try {
      return await Company.find().sort({ name: 'asc' });
    } catch (error) {
      console.error('Error getting all companies without pagination:', error);
      throw error;
    }
  }

  async getCompanyByIdUserManager(id) {
    try {
      return await Company.findOne({ adminId: id }).exec();
    } catch (error) {
      console.log('Error getting company by user manager ID:', error);
      throw error;
    }
  }

  async getCompaniesAndAdminsByInstitutionId(institutionId) {
    try {
      const exams = await Exam.find({ institutionId }).select('personId');
      const personIds = [...new Set(exams.map((exam) => exam.personId))];
      const persons = await Person.find({ _id: { $in: personIds } }).select('company_id');
      const companyIds = [...new Set(persons.flatMap((person) => person.company_id))];
      return await Company.find({ _id: { $in: companyIds } }).populate('adminId', 'name email');
    } catch (err) {
      console.error('Error fetching companies and admins:', err);
      throw err;
    }
  }

  async getCompaniesAndAdminsByInstitutionId2(options) {
    try {
      const exams = await Exam.find({ institutionId: options.institutionId }).select('personId');
      const personIds = [...new Set(exams.map((exam) => exam.personId))];
      const persons = await Person.find({ _id: { $in: personIds } }).select('company_id');
      const companyIds = [...new Set(persons.flatMap((person) => person.company_id))];
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

module.exports = new CompanyRepository();
