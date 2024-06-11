const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const examSchema = Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'organizations' },
    usagerId: { type: Schema.Types.ObjectId, ref: 'usager' },
    goal: {
        type: String,
        enum: ['Financing', 'Upgrading', 'Support']
    }

}, { timestamps: true });

// Function to generate a random alphanumeric string of a given length


examSchema.plugin(aggregatePaginate);
module.exports = quiz = mongoose.model('exam', examSchema);
