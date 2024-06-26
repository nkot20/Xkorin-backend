const mongoose = require('mongoose');

const optionTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    optionId: { type: mongoose.Schema.Types.ObjectId, ref: 'options' }
}, { timestamps: true });

const optionTranslation = mongoose.model('optionTranslation', optionTranslationSchema);

module.exports = optionTranslation;
