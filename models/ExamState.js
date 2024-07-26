const mongoose = require('mongoose');

const ExamStateSchema = new mongoose.Schema({
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'exams' },

}, { timestamps: true });

const examState = mongoose.model('examState', ExamStateSchema);

module.exports = examState;
