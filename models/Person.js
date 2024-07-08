const { FirebaseScrypt } = require('firebase-scrypt');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Schema } = require('mongoose');
const Roles = require('../config/role');

const PersonSchema = new mongoose.Schema({
  company_id: [{ type: Schema.Types.ObjectId, ref: 'companies' }],
  profil_id: [{ type: Schema.Types.ObjectId, ref: 'profils' }],
  subcategory_id: [{ type: Schema.Types.ObjectId, ref: 'subcategories' }],
  user_id: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  name: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    required: false,
  },
  birthdate: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
  },
  mobile_no: {
    type: String,
    required: false,
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
  updated_date: {
    type: Date,
    default: Date.now(),
  },
  matrimonial_status: {
    type: String,
    enum: ['Single', 'Married', 'Others'],
  },
  level_of_education: {
    type: String,
    enum: ['Self-taugh', '1st School Living Certificate ', 'GCE O Level/ CAP', 'GCE A Level', '1st year Undergraduate', '2nd year undergraduate', '3rd year undergraduate', 'Postgraduate +1year', 'Masters', 'PhD', 'Other']
  }


}, { timestamps: true });


PersonSchema.plugin(aggregatePaginate);

const Person = mongoose.model('persons', PersonSchema);
module.exports = Person;
