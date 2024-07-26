require('dotenv').config();
const Examen = require('../models/Exam');
const Person = require('../models/Person');
const Company = require('../models/Company')
const Institution = require('../models/Institution');
const SubcategoryImprint = require('../models/SubCategoryImprint');
const imprintRepository = require('../repositories/ImprintRepository');
const {response} = require("express");
class ExamRepository {
<<<<<<< Updated upstream
=======
    /**
     *
     * @param payload
     * @returns {Promise<any>}
     */
>>>>>>> Stashed changes
    async create(payload) {
        try {
            return await Examen.create(payload);
        } catch (error) {
            throw error;
        }
    }

    async getExamById(id) {
        try {
            const exam = await Examen.findById(id);
            const person = await Person.findById(exam.personId);
            const institution = await Institution.findById(exam.institutionId);
            const company = await Company.findById(person.company_id[0]);
            return {exam, person, company, institution}
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    async getExamByPersonId(personId) {
        try {
            const person = await Person.findById(personId);
            if (!person)
                throw new Error("This person doesn't exist");
            const exams = await Examen.find({personId}).sort({ createdAt: -1 }).populate('institutionId').exec();
            let response = [];
            await Promise.all(exams.map(async (exam) =>  {
                const indiceAvailable = await imprintRepository.getAvailableExam(exam._id);
                response.push({exam, indiceAvailable})
            }))
            return response;
        } catch (error) {
            console.error(error)
            throw error;
        }
    }
}

const examRepository = new ExamRepository();
module.exports = examRepository;