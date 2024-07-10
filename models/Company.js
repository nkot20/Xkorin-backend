const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const companySchema = Schema({
  promoterId: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'NeedsValidation'],
    default: 'Active',
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    rue: { type: String},
    city: { type: String},
    country: { type: String}
  },
  customization: {
    logo: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    }
  },
  agreements: {
    type: Boolean,
  },
  description: {
    type: String,
  },
  country: {
    type: String,
    required: false,
  },

}, { timestamps: true });

// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  console.log(result);
  return result;
}



companySchema.plugin(aggregatePaginate);
module.exports = company = mongoose.model('company', companySchema);
