const mongoose = require('mongoose');
const { Schema } = mongoose;

const programSchema = Schema({
    institutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
    name: {
        type: String,
        required: true,
    },
    targetInstitutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
}, { timestamps: true });

const Program = mongoose.model('program', programSchema);

module.exports = Program;
