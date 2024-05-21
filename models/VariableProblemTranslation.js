const mongoose = require('mongoose');

const variableProblemTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' }
}, { timestamps: true });

const variableProblemTranslation = mongoose.model('variableProblemTranslation', variableProblemTranslationSchema);

module.exports = variableProblemTranslation;
