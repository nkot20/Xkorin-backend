const mongoose = require('mongoose');

const AuditorExam = new mongoose.Schema({
    auditorId: {type: mongoose.Schema.Types.ObjectId, ref: 'auditors'},
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'exams' },
}, { timestamps: true });

const auditorExam = mongoose.model('auditorExam', AuditorExam);

module.exports = auditorExam;
