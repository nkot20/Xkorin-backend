// FactorModel.js
const mongoose = require('mongoose');

const FactorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isAddedByCompany: {
        type: Boolean,
        default: false,
    },
    dafaultWeight: {
        type: Number,
        default: 6
    },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' }
}, { timestamps: true });

const factor = mongoose.model('factor', FactorSchema);

module.exports = factor;
