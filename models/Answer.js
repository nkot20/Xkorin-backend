const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'questions' },
    optionId: { type: mongoose.Schema.Types.ObjectId, ref: 'options' },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'exams' },

}, { timestamps: true });

const answer = mongoose.model('answer', answerSchema);

module.exports = answer;
