// FootprintSchema.js
const mongoose = require('mongoose');


const companyVariableSchema = new mongoose.Schema({
    companyId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'organizations' }],
    variableId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variables' }],
}, { timestamps: true });

const organisationVariable = mongoose.model('organizationVariables', companyVariableSchema);

module.exports = organisationVariable;
