const mongoose = require('mongoose');

const propositionTranslationSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages' },
    propositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'propositions' }
}, { timestamps: true });

const propositionTranslation = mongoose.model('propositionTranslation', propositionTranslationSchema);

module.exports = propositionTranslation;
