require('dotenv').config();
const AnswerRepository = require('../repositories/AnswerRepository');
const ExamState = require('../models/ExamState');

class AnswerService {
    async create(answers) {
        try {
            // Ensure the answers array is not empty and contains a valid examId
            if (answers.length === 0 || !answers[0].examId) {
                throw new Error('Invalid answers array!');
            }

            // Verify the existence of the exam
            const exam = await AnswerRepository.findExamById(answers[0].examId);
            if (!exam) {
                throw new Error('Exam doesn\'t exist!');
            }

            // Process each answer to update the exam state
            await Promise.all(answers.map(async (answer) => {
                // Find the question to obtain the variableId
                const question = await AnswerRepository.findQuestionById(answer.questionId);
                if (!question) {
                    throw new Error(`Question with ID ${answer.questionId} not found!`);
                }

                // Check if the exam state for this variable already exists
                const existingExamState = await AnswerRepository.findExamStateByVariableAndExam(question.variableId, answer.examId);

                // If it doesn't exist, create a new exam state
                if (!existingExamState) {
                    const newExamState = new ExamState({
                        variableId: question.variableId,
                        examId: answer.examId,
                    });
                    await AnswerRepository.saveExamState(newExamState);
                }
            }));

            // Insert all the answers
            return await AnswerRepository.insertManyAnswers(answers);
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
        const newDate = new Date(date); // Create a copy of the original date
        newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Add the specified number of years
        return newDate;
    }
}

module.exports = new AnswerService();
