// FootprintSchema.js
const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    label: {
        type: String,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
}, { timestamps: true });

const SubCategory = mongoose.model('subcategory', SubCategorySchema);

module.exports = SubCategory;
