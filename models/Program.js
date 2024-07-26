const mongoose = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { Schema } = mongoose;

const programSchema = Schema({
    institutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
    name: {
        type: String,
        required: true,
    },
    archived: {
       type: Boolean,
       default: false,
    },
    targetInstitutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
}, { timestamps: true });

programSchema.plugin(aggregatePaginate);
const Program = mongoose.model('program', programSchema);

module.exports = Program;
