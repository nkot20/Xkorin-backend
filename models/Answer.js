const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    propositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'propositions' },
    usagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'usagers' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'quizzes' },
    value: {
        type: Boolean,
        require: true
    }
}, { timestamps: true });

const answer = mongoose.model('answer', answerSchema);

module.exports = answer;
