const mongoose = require('mongoose');
const Variable = require('../models/Variable');
const VariableTranslation = require('../models/VariableTranslation');
const Language = require("../models/Language");

class VariableRepository {
    async create(datas) {
        return await Variable.create(datas);
    }

    async findById(variableId) {
        return await Variable.findById(variableId);
    }

    async findAllByCompanyId(companyId) {
        return await Variable.aggregate([
            {
                $lookup: {
                    from: 'factors',
                    localField: '_id',
                    foreignField: 'variableId',
                    as: 'factors'
                }
            }
        ]);
    }

    async findByIdAndDelete(variableId) {
        return await Variable.findByIdAndDelete(variableId);
    }

    async findByImprintId(imprintId) {
        return await Variable.find({ imprintId: imprintId });
    }

    async updateOne(filter, update) {
        return await Variable.updateOne(filter, update);
    }

    async findTranslations(variableId, type) {
        return await VariableTranslation.aggregate([
            {
                $match: {
                    variableId: mongoose.Types.ObjectId(variableId),
                    type: type
                }
            },
            {
                $lookup: {
                    from: 'languages', // Name of the language collection
                    localField: 'languageId',
                    foreignField: '_id',
                    as: 'language'
                }
            },
            {
                $unwind: '$language' // Deconstruct the array field from the input document to output a document for each element
            },
            {
                $project: {
                    isoCode: '$language.isoCode',
                    label: 1
                }
            }
        ]);
    }

    async deleteTranslations(variableId) {
        return await VariableTranslation.deleteMany({ variableId });
    }

    async findTranslation(languageId, variableId, type) {
        return await VariableTranslation.find({ languageId, variableId, type });
    }

    async createTranslation(data) {
        return await VariableTranslation.create(data);
    }

    async updateTranslation(filter, update) {
        return await VariableTranslation.updateOne(filter, update);
    }
}

module.exports = new VariableRepository();
