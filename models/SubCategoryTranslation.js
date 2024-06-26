const mongoose = require('mongoose');

const subCategoryTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategories' }
}, { timestamps: true });

const subCategoryTranslation = mongoose.model('SubcategoryTranslation', subCategoryTranslationSchema);

module.exports = subCategoryTranslation;
