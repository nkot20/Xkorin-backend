// FootprintSchema.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    label: {
        type: String,
    },
    type: { type: String, enum: ['company', 'institution', 'other'], required: true },
    archived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Category = mongoose.model('category', CategorySchema);

module.exports = Category;
