const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const companySchema = Schema({
  adminId: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  additionalAddress: {
    type: String,
    required: false,
  },
  legalForm: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'NeedsValidation'],
    default: 'active',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  customization: {
    primaryColor: {
      type: String,
      default: '',
    },
    secondaryColor: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    backgroundImage: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
  },
  domain: {
    type: String,
  },
  ville: {
    type: [String],
  },
  agreements: {
    type: Boolean,
  },
  description: {
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
  console.log(result);
  return result;
}

companySchema.pre('save', async function (next) {
  console.log(this.business_code);
  if (!this.business_code) {
    let uniqueCode = generateRandomString(10);
    const count = await this.constructor.countDocuments({ business_code: uniqueCode });
    if (count === 0) {
      this.business_code = uniqueCode;
    } else {
      while (true) {
        console.log('Generating new string');
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


companySchema.plugin(aggregatePaginate);
module.exports = company = mongoose.model('company', companySchema);
