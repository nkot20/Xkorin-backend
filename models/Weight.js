const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    value: { /// to know if question is a exam question with points or it's just to get information (factor weight or information)
        type: Number,
    },
    factorId: { type: mongoose.Schema.Types.ObjectId, ref: 'factors' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organisationId' }
}, { timestamps: true });

const weight = mongoose.model('weight', weightSchema);

module.exports = weight;
