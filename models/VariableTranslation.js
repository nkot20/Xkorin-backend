const mongoose = require('mongoose');

const variableTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    type: {
      type: String,
      enum: ['Problem', 'Definition', 'Name']
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' }
}, { timestamps: true });

const variableTranslation = mongoose.model('variableTranslation', variableTranslationSchema);

module.exports = variableTranslation;
