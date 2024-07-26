require('dotenv').config();
const Answer = require('../models/Answer');
const Option = require('../models/Option');
const Exam = require('../models/Exam');
const ExamState = require('../models/ExamState');
const Question = require('../models/Question');
const {ObjectId} = require("mongodb");
const Helper = require('../common/Helper');


class AnswerRepository {

    async create(answers) {
        try {
            // Ensure the answers array is not empty and contains a valid examId
            if (answers.length === 0 || !answers[0].examId) {
                throw new Error('Invalid answers array!');
            }

            // Verify the existence of the exam
            const exam = await Exam.findById(answers[0].examId);
            if (!exam) {
                throw new Error('Exam doesn\'t exist!');
            }

            // Process each answer to update the exam state
            await Promise.all(answers.map(async (answer) => {
                // Find the question to obtain the variableId
                const question = await Question.findById(answer.questionId);
                if (!question) {
                    throw new Error(`Question with ID ${answer.questionId} not found!`);
                }

                // Check if the exam state for this variable already exists
                const existingExamState = await ExamState.findOne({
                    variableId: question.variableId,
                    examId: answer.examId,
                });

                // If it doesn't exist, create a new exam state
                if (!existingExamState) {
                    const newExamState = new ExamState({
                        variableId: question.variableId,
                        examId: answer.examId,
                    });
                    await newExamState.save();
                }
            }));

            // Insert all the answers
            return await Answer.insertMany(answers);
        } catch (error) {
            console.error('Error creating answers:', error);
            throw error;
        }
    }
     formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    addYearsToDate(date, yearsToAdd) {
        const newDate = new Date(date); // Crée une copie de la date d'origine
        newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Ajoute le nombre d'années spécifié
        return newDate;
    }

}

const answerRepository = new AnswerRepository();
module.exports = answerRepository;