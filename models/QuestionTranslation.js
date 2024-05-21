const mongoose = require('mongoose');

const questionTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'questions' }
}, { timestamps: true });

const questionTranslation = mongoose.model('questionTranslation', questionTranslationSchema);

module.exports = questionTranslation;
