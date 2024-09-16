const mongoose = require('mongoose');

const ProgramImprintSchema = new mongoose.Schema({
    imprintId: {type: mongoose.Schema.Types.ObjectId, ref: 'imprints'},
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'programs' },

}, { timestamps: true });

const programImprint = mongoose.model('programImprint', ProgramImprintSchema);

module.exports = programImprint;
