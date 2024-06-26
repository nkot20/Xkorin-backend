
const mongoose = require('mongoose');
const { Schema } = mongoose;

const optionSchema = Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    isItImportant:  {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Option = mongoose.model('option', optionSchema);

module.exports = Option;
