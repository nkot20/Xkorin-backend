const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const institutionSchema = Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'users' },
  subCategoryId: { type: Schema.Types.ObjectId, ref: 'subcategories' },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
    required: true,
  },
  type: {
    type: String,
    enum: ['Financing', 'Grant', 'Support'],
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
    signature:  {
      type: String,
    }
  },
  agreements: {
    type: Boolean,
  },
  description: {
    type: String,
  },
  business_code: {
    type: String,
  }
}, { timestamps: true });

// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  return result;
}

institutionSchema.pre('save', async function (next) {
  if (!this.business_code) {
    let uniqueCode = generateRandomString(10);
    const count = await this.constructor.countDocuments({ business_code: uniqueCode });
    if (count === 0) {
      this.business_code = uniqueCode;
    } else {
      while (true) {
        uniqueCode = generateRandomString(10);
        const newCount = await this.constructor.countDocuments({ business_code: uniqueCode });
        if (newCount === 0) {
          this.business_code = uniqueCode;
          break;
        }
      }
    }
  }
  next();
});


institutionSchema.plugin(aggregatePaginate);
module.exports = institution = mongoose.model('institution', institutionSchema);
