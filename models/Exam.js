const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const examSchema = Schema({
    institutionId: { type: Schema.Types.ObjectId, ref: 'institution' },
    personId: { type: Schema.Types.ObjectId, ref: 'person' },
    aim: {
        type: String,
        enum: ['Financing', 'Upgrading', 'Support']
    },
    amount : {
        type: Number,
    },
    audited: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Function to generate a random alphanumeric string of a given length


examSchema.plugin(aggregatePaginate);
module.exports = quiz = mongoose.model('exam', examSchema);
