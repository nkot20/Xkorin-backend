const mongoose = require('mongoose');
const { Schema } = mongoose;

const propositionSchema = Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'questions' }
}, { timestamps: true });

const proposition = mongoose.model('proposition', propositionSchema);

module.exports = proposition;
