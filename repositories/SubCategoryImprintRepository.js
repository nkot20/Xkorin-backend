require('dotenv').config();
const SubCategoryImprint = require('../models/SubCategoryImprint');
const ImprintRepository = require('../repositories/ImprintRepository');

class SubCategoryImprintRepository {
    async create(imprintId, subcategoryId) {
        try {
            //const imprint = await ImprintRepository.
            return await SubCategoryImprint.create({imprintId, subcategoryId});
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

    async getImprintIdBySubcategoryId(subcategoryId) {
        try {
            const resp = await SubCategoryImprint.find({subcategoryId});
            const imprintIds = [];
            resp.forEach(value => {
                imprintIds.push(value.imprintId);
            })
            return imprintIds;
        } catch (error) {
            console.error("Something went to wrong: ", error);
            throw error;
        }
    }

}

const subCategoryImprintRepository = new SubCategoryImprintRepository();
module.exports = subCategoryImprintRepository;