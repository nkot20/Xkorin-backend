// services/SubCategoryImprintService.js
const SubCategoryImprintRepository = require('../repositories/SubCategoryImprintRepository');

class SubCategoryImprintService {
    async createSubCategoryImprint(imprintId, subcategoryId) {
        try {
            // Additional business logic can be added here if needed
            return await SubCategoryImprintRepository.createSubCategoryImprint(imprintId, subcategoryId);
        } catch (error) {
            console.error("Error creating subcategory imprint: ", error);
            throw error;
        }
    }

    async getImprintIdsBySubcategoryId(subcategoryId) {
        try {
            // Additional business logic can be added here if needed
            return await SubCategoryImprintRepository.findImprintIdsBySubcategoryId(subcategoryId);
        } catch (error) {
            console.error("Error getting imprint IDs by subcategory ID: ", error);
            throw error;
        }
    }
}

module.exports = new SubCategoryImprintService();
