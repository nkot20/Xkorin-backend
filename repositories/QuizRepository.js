require('dotenv').config();

const Quiz = require('../models/Examen');

const {ObjectId} = require("mongodb");

class QuizRepository {

    async create(data) {
        try {
            return await Quiz.create(data);
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            return await Quiz.updateOne({_id: new ObjectId(id)},data);
        } catch (error) {
            throw error;
        }
    }


    async findByCompany(id) {
        try {
            let quizList = await Quiz.find({companyId: [new ObjectId(id)]});
            // Trier la liste de Quiz par ordre décroissant de la date de création
            quizList.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            // Formater la date createdAt pour chaque Quiz
            const formattedQuizList = quizList.map(quiz => {
                const createdAt = quiz.createdAt;
                const formattedDate = `${createdAt.getHours()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()}`;
                return {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    minMean: quiz.minMean,
                    isActive: quiz.isActive,
                    createdAt: formattedDate
                };
            });

            return formattedQuizList;
        } catch (error) {
            throw error;
        }
    }

}

const quizRepository = new QuizRepository();

module.exports = quizRepository;