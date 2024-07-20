require('dotenv').config();
const Exam = require('../models/Exam');
const Person = require('../models/Person');
const Company = require('../models/Company');
const Program = require('../models/Program');
const Institution = require('../models/Institution');
class ExamRepository {
    /**
     *
     * @param payload
     * @returns {Promise<HydratedDocument<unknown, {}, {}>[]>}
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
     * @returns {Promise<{exam: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, {}, unknown> & {}, institution: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, {}, unknown> & {}, person: Query<Document<unknown, any, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & Omit<InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>> & {_id: Types.ObjectId}, never> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TVirtuals"> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TInstanceMethods">, Document<unknown, any, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & Omit<InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>> & {_id: Types.ObjectId}, never> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TVirtuals"> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TInstanceMethods">, ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TQueryHelpers">, InferSchemaType<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>>> & ObtainSchemaGeneric<module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, {timestamps: boolean}, {birthdate: {type: Date | DateConstructor, required: boolean}, role: {type: String | StringConstructor}, company_id: [{ref: string, type: ObjectId}], gender: {type: String | StringConstructor}, level_of_education: {type: String | StringConstructor, enum}, mobile_no: {type: String | StringConstructor, required: boolean}, profil_id: [{ref: string, type: ObjectId}], matrimonial_status: {type: String | StringConstructor, enum: string[]}, subcategory_id: [{ref: string, type: ObjectId}], user_id: [{ref: string, type: ObjectId}], name: {type: String | StringConstructor}, created_date: {default: *|number, type: Date | DateConstructor}, updated_date: {default: *|number, type: Date | DateConstructor}, email: {type: String | StringConstructor, required: boolean}}>, "TQueryHelpers">, company: Query<Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, Document<unknown, any, unknown> & Omit<unknown extends {_id?: infer U} ? IfAny<U, {_id: Types.ObjectId}, Required<{_id: U}>> : {_id: Types.ObjectId}, never> & {}, {}, unknown> & {}}>}
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