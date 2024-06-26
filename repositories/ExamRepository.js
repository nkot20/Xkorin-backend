require('dotenv').config();
const Examen = require('../models/Exam');
const Person = require('../models/Person');
const SubcategoryImprint = require('../models/SubCategoryImprint');
class ExamRepository {
    async create(payload) {
        try {
            return await Examen.create(payload);
        } catch (error) {
            throw error;
        }
    }

    async getExamByPersonId(personId) {
        try {
            const person = await Person.findById(personId);
            if (!person)
                throw new Error("This person doesn't exist");
            const imprints = await SubcategoryImprint.findOne({subcategoryId: person.subcategory_id});
            const indiceAvailable = !(imprints.length < 5)
            const exams = await Examen.find({personId}).sort({ createdAt: -1 }).populate('institutionId').exec();
            return {exams, indiceAvailable};
        } catch (error) {
            console.error(error)
            throw error;
        }
    }
}

const examRepository = new ExamRepository();
module.exports = examRepository;