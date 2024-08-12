const Answer = require('../models/Answer');
const Exam = require('../models/Exam');
const ExamState = require('../models/ExamState');
const Question = require('../models/Question');

class AnswerRepository {
    async findExamById(examId) {
        try {
            return await Exam.findById(examId);
        } catch (error) {
            throw error;
        }
    }

    async findQuestionById(questionId) {
        try {
            return await Question.findById(questionId);
        } catch (error) {
            throw error;
        }
    }

    async findExamStateByVariableAndExam(variableId, examId) {
        try {
            return await ExamState.findOne({
                variableId,
                examId,
            });
        } catch (error) {
            throw error;
        }
    }

    async saveExamState(examState) {
        try {
            return await examState.save();
        } catch (error) {
            throw error;
        }
    }

    async insertManyAnswers(answers) {
        try {
            return await Answer.insertMany(answers);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AnswerRepository();
