// VariableModel.js
const mongoose = require('mongoose');

const VariableSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isAddedByCompany: {
        type: Boolean,
        default: false,
    },
    dafaultWeight: {
        type: Number,
        default: 7
    },
    definition: {
        type: String,
        required: false
    },
    problem: {
        type: String,
        required: false
    },
    isFactor: {
        type: Boolean,
        default: false,
    },
    //factors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'factors' }], // Les facteurs liés à cette variable
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variables' }], // Les variables liées à cette variable
    imprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'imprints' }
}, { timestamps: true });

const variable = mongoose.model('variable', VariableSchema);

module.exports = variable;
