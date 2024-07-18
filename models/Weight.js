const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    optionId: {type: mongoose.Schema.Types.ObjectId, ref: 'options'},
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'institutions' },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' }
}, { timestamps: true });

const weight = mongoose.model('weight', weightSchema);

module.exports = weight;
