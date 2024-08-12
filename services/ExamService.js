const examRepository = require('../repositories/ExamRepository');
const personRepository = require('../repositories/PersonRepository');
const companyRepository = require('../repositories/CompanyRepository');
const programService = require('../services/ProgramService');
const institutionService = require('../services/InstitutionService');

class ExamService {

    async createExam(payload) {
        try {
            const exam = await examRepository.create(payload);
            return exam;
        } catch (error) {
            throw error;
        }
    }

    async getExamById(id) {
        try {
            const exam = await examRepository.findById(id);
            if (!exam) throw new Error("Exam not found");

            const program = await programService.getById(exam.programId);
            if (!program) throw new Error("Program not found");

            const institution = await institutionService.getInstitutionById(program.institutionId);
            if (!institution) throw new Error("Institution not found");

            const person = await personRepository.findById(exam.personId);
            if (!person) throw new Error("Person not found");

            const company = await companyRepository.getCompany(person.company_id[0]);
            if (!company) throw new Error("Company not found");

            return { exam, person, company, institution };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getExamByPersonId(personId) {
        try {
            const person = await personRepository.findById(personId);
            if (!person) throw new Error("This person doesn't exist");

            const exams = await examRepository.findByPersonId(personId);

            return await Promise.all(exams.map(async (exam) => {
                const program = await programService.getById(exam.programId);
                const institution = await institutionService.getInstitutionById(program.institutionId);
                return { exam, program, institution };
            }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPersonProfileByExamId(examId) {
        try {
            const result = await examRepository.aggregatePersonProfile(examId);

            if (!result || result.length === 0) {
                throw new Error('Examen ou profil de la personne non trouvé');
            }

            return result[0].personProfile.profil_id;
        } catch (error) {
            console.error('Erreur lors de la récupération du profil de la personne:', error);
            throw error;
        }
    }

    async getExamsByPersonAndInstitution(personId, institutionId) {
        try {
            const programs = await programService.listProgramsByInstitutionWithoutPagination(institutionId);
            const programIds = programs.map(program => program._id);

            return await examRepository.findByPersonIdAndProgramIds(personId, programIds);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getLatestExamByPersonAndInstitution(personId, institutionId) {
        try {
            const programs = await programService.listProgramsByInstitutionWithoutPagination(institutionId);
            const programIds = programs.map(program => program._id);

            return await examRepository.findOneByPersonIdAndProgramIds(personId, programIds);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getInstitutionByExamId(examId) {
        try {
            const result = await examRepository.aggregateInstitution(examId);

            if (!result || result.length === 0) {
                throw new Error('Institution non trouvée pour cet examen');
            }

            return result[0].institution;
        } catch (error) {
            console.error('Erreur:', error.message);
            throw error;
        }
    }
}

module.exports = new ExamService();
