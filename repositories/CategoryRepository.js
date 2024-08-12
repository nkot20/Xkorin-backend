const Category = require('../models/Category');

class CategoryRepository {
    async createCategory(categoryData) {
        try {
            return await Category.create(categoryData);
        } catch (error) {
            throw error;
        }
    }

    async findAllCategories() {
        try {
            return await Category.find();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryRepository();
