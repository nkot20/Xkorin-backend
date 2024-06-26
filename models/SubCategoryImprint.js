const mongoose = require('mongoose');

const subCategoryImprintSchema = new mongoose.Schema({
    imprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'imprints' },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategories' }
}, { timestamps: true });

const subCategoryImprint = mongoose.model('subCategoryImprint', subCategoryImprintSchema);

module.exports = subCategoryImprint;
