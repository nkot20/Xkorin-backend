const mongoose = require('mongoose');

const definitionTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' }
}, { timestamps: true });

const definitionTranslation = mongoose.model('definitionTranslation', definitionTranslationSchema);

module.exports = definitionTranslation;
