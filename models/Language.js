const mongoose = require('mongoose');
const { Schema } = mongoose;

const languageSchema = Schema({
    label: {
        type: String,
        required: true,
    },
    isoCode: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const language = mongoose.model('language', languageSchema);

module.exports = language;
