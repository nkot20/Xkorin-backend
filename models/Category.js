// FootprintSchema.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    label: {
        type: String,
    }
}, { timestamps: true });

const Category = mongoose.model('category', CategorySchema);

module.exports = Category;
