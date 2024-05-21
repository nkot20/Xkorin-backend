require('dotenv').config();

const Company = require('../models/Company');
const User = require('../models/User');

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

  async getAllActiveCompanies() {
    try {
      return await Company.find({ status: 'Active' });
    } catch (error) {
      console.log('get all active companies', error);
      throw error;
    }
  }

  async getAllActiveCompanies() {
    try {
      return await Company.find({ status: 'Active' });
    } catch (error) {
      console.log('get all active companies', error);
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

  async getCompanyUsers(id, options) {
    try {
      const regex = new RegExp(options.search, 'i');
      const company = await Company.findById(id);

      if (!company) {
        return null;
      }

      const aggregate = Company.aggregate([
        {
          $match: {
            business_code: company.business_code,
            $and: [
              {
                $or: [
                  { last_name: regex },
                  { first_name: regex },
                  { email: regex },
                  { phoneNumber: regex },
                ],
              },
            ],
          },
        },
        {
          $sort: {
            last_name: 1,
          },
        },
      ]);

      return await User.aggregatePaginate(aggregate, options);
    } catch (error) {
      console.log('Get Company by Id error', error);
      throw error;
    }
  }

  // Get Company by business Code
  async getCompanyByCode(businessCode) {
    try {
      return await Company.findOne({ business_code: businessCode });
    } catch (error) {
      console.error(`Error finding company : ${error}`);
      throw error;
    }
  }

  async getAvailableCompaniesForTempUsers() {
    try {
      return await Company.find({ availableForTempUsers: true })
        .select('name _id business_code');
    } catch (error) {
      console.error('Error finding companies available for temp users');
      throw error;
    }
  }

  async createCompany(data, status = 'active') {
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
}

const companyRepository = new CompanyRepository();

module.exports = companyRepository;
