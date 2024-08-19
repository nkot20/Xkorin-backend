// repositories/SubCategoryImprintRepository.js
const SubCategoryImprint = require('../models/SubCategoryImprint');

class SubCategoryImprintRepository {
    async createSubCategoryImprint(imprintId, subcategoryId) {
        try {
            return await SubCategoryImprint.create({ imprintId, subcategoryId });
        } catch (error) {
            console.error("Error creating SubCategoryImprint: ", error);
            throw error;
        }
    }

    async findImprintIdsBySubcategoryId(subcategoryId) {
        try {
            const results = await SubCategoryImprint.find({ subcategoryId });
            return results.map(result => result.imprintId);
        } catch (error) {
            console.error("Error finding imprint IDs by subcategory ID: ", error);
            throw error;
        }
    }
}

module.exports = new SubCategoryImprintRepository();
