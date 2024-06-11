const mongoose = require('mongoose');

const categoryTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
}, { timestamps: true });

const categoryTranslation = mongoose.model('categoryTranslation', categoryTranslationSchema);

module.exports = categoryTranslation;
