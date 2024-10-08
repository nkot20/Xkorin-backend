const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const examSchema = Schema({
    programId: { type: Schema.Types.ObjectId, ref: 'program' },
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
    },
    createdAt: { type: Date, default: Date.now }

});

// Function to generate a random alphanumeric string of a given length


examSchema.plugin(aggregatePaginate);
module.exports = Exam = mongoose.model('exam', examSchema);
