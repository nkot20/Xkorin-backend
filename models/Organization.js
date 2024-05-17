const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const organizationSchema = Schema({
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


organizationSchema.plugin(aggregatePaginate);
module.exports = company = mongoose.model('organization', organizationSchema);
