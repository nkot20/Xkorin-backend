const mongoose = require('mongoose');

const imprintInstitutionSchema = new mongoose.Schema({
    imprintId: {type: mongoose.Schema.Types.ObjectId, ref: 'imprints'},
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'institutions' },
    status: {
        type: String,
        enum: ['Able', 'Enable']
    },
    isAddedForAnInstitution: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const imprintInstitution = mongoose.model('imprintInstitution', imprintInstitutionSchema);

module.exports = imprintInstitution;
