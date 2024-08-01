require('dotenv').config();
const Exam = require('../models/Exam');
const Person = require('../models/Person');
const Company = require('../models/Company');
const Program = require('../models/Program');
const Institution = require('../models/Institution');
const mongoose = require('mongoose');
class ExamRepository {

    /**
     *
     * @param payload
     * @returns {Promise<any>}
     */

    async create(payload) {
        try {
            return await Exam.create(payload);
        } catch (error) {
            throw error;
        }
    }

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    async getExamById(id) {
        try {
            // Récupérer l'examen
            const exam = await Exam.findById(id).exec();
            if (!exam) {
                throw new Error("Exam not found");
            }

            // Récupérer les détails du programme
            const program = await Program.findById(exam.programId).exec();
            if (!program) {
                throw new Error("Program not found");
            }

            // Récupérer les détails de l'institution à partir du programme
            const institution = await Institution.findById(program.institutionId).exec();
            if (!institution) {
                throw new Error("Institution not found");
            }

            // Récupérer la personne associée à l'examen
            const person = await Person.findById(exam.personId).exec();
            if (!person) {
                throw new Error("Person not found");
            }

            // Récupérer la compagnie associée à la personne
            const company = await Company.findById(person.company_id[0]).exec();
            if (!company) {
                throw new Error("Company not found");
            }

            return { exam, person, company, institution };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    /**
     *
     * @param personId
     * @returns {Promise<*[]>}
     */
    async getExamByPersonId(personId) {
        try {
            const person = await Person.findById(personId);
            if (!person) {
                throw new Error("This person doesn't exist");
            }

            // Récupérer les examens de la personne
            const exams = await Exam.find({ personId }).sort({ createdAt: -1 }).exec();

            // Récupérer les détails du programme et de l'institution pour chaque examen
            return await Promise.all(exams.map(async (exam) => {
                const program = await Program.findById(exam.programId).exec();
                const institution = await Institution.findById(program.institutionId).exec();
                return {exam, program, institution};
            }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPersonProfileByExamId(examId) {
        try {
            // Utiliser l'agrégat pour récupérer le profil de la personne
            const result = await Exam.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(examId) } }, // Filtrer par examId
                {
                    $lookup: {
                        from: 'persons', // Nom de la collection des personnes
                        localField: 'personId',
                        foreignField: '_id',
                        as: 'personProfile'
                    }
                },
                { $unwind: '$personProfile' }, // Décompresser le tableau résultant
                {
                    $project: {
                        _id: 0, // Exclure l'_id de l'examen
                        'personProfile._id': 1,
                        'personProfile.name': 1,
                        'personProfile.email': 1,
                        'personProfile.birthdate': 1,
                        'personProfile.gender': 1,
                        'personProfile.mobile_no': 1,
                        'personProfile.matrimonial_status': 1,
                        'personProfile.level_of_education': 1,
                        'personProfile.role': 1,
                        'personProfile.profil_id': 1
                    }
                }
            ]);

            if (!result || result.length === 0) {
                throw new Error('Examen ou profil de la personne non trouvé');
            }

            return result[0].personProfile.profil_id;
        } catch (error) {
            console.error('Erreur lors de la récupération du profil de la personne:', error);
            throw error;
        }
    }


    /**
     *
     * @param personId
     * @param institutionId
     * @returns {Promise<Array<HydratedDocument<unknown, {}, {}>>>}
     */
    async getExamsByPersonAndInstitution(personId, institutionId) {
        try {
            // Trouver tous les programmes liés à l'institutionId
            const programs = await Program.find({ institutionId }).exec();

            // Extraire les ids des programmes trouvés
            const programIds = programs.map(program => program._id);

            // Trouver tous les examens liés à personId et aux programmes trouvés
            return await Exam.find({
                personId,
                programId: {$in: programIds}
            }).exec();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     *
     * @param personId
     * @param institutionId
     * @returns {Promise<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}>}
     */
    async getLatestExamByPersonAndInstitution(personId, institutionId) {
        try {
            // Trouver tous les programmes liés à l'institutionId
            const programs = await Program.find({ institutionId }).exec();

            // Extraire les ids des programmes trouvés
            const programIds = programs.map(program => program._id);

            // Trouver le dernier examen lié à personId et aux programmes trouvés
            return await Exam.findOne({
                personId,
                programId: {$in: programIds}
            }).sort({createdAt: -1}).exec();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


}

const examRepository = new ExamRepository();
module.exports = examRepository;