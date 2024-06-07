const mongoose = require('mongoose');
const { Schema } = mongoose;

const profilTranslationSchema = Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    profilId: { type: mongoose.Schema.Types.ObjectId, ref: 'profils' }

}, { timestamps: true });

const profilTranslation = mongoose.model('profilTranslation', profilTranslationSchema);

module.exports = profilTranslation;
