const User = require('../models/User');

//const logger = require('../logger');

const timestamp = new Date();

const userRepository = {
  async getUserByEmail(email) {
    try {
      return await User.findOne({email});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /**
     * @param handle {string}
     * @param type {"phone" | "email" | "facebook"}
     * @return {Promise<Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, {}, unknown> & {}>}
     */
  async getUserByTypeAndHandle(handle, type) {
    try {
      return await User.findOne({[type]: handle});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getUserByPhone(phone) {
    try {
      return await User.findOne({mobile_no: phone});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      return await User.findOne({_id: userId});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async createUser(data) {
    try {
      const newUser = new User(data);
      //logger.info('User created successfully', { result, timestamp });
      return await newUser.save();
    } catch (error) {
      //logger.error('Error creating user', { error });
      console.error(error);
      throw error;
    }
  },

  async updateUser(userId, data) {
    try {
      return await User.findOneAndUpdate({_id: userId}, data, {new: true});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getByCompany(companyId) {
    try {
      return await User.find({company_id: companyId});
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAll(options) {
    try {
      const regex = new RegExp(options.search, 'i');

      const aggregate = User.aggregate([
        {
          $sort: {
            [options.sortBy]: options.sortDirection,
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { first_name: regex },
                  { last_name: regex },
                  { user_name: regex },
                  { email: regex },
                  { birthdate: regex },
                  { status: regex },
                  { mobile_no: regex },
                ],
              },
            ],
          },
        },
      ]);

      return await User.aggregatePaginate(aggregate, options);
    } catch (error) {
      console.log('List Individual User error', error);
      throw error;
    }
  },
};

module.exports = userRepository;
