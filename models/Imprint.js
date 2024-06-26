// FootprintSchema.js
const mongoose = require('mongoose');

const imprintSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    color: {
        type: String,
    },
    number: {
        type: Number,
    }
}, { timestamps: true });

const imprint = mongoose.model('imprint', imprintSchema);

module.exports = imprint;
