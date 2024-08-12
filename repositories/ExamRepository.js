require('dotenv').config();
const Exam = require('../models/Exam');
const Person = require('../models/Person');
const Company = require('../models/Company');
const Program = require('../models/Program');
const Institution = require('../models/Institution');
const mongoose = require('mongoose');

class ExamRepository {

    async create(payload) {
        return await Exam.create(payload);
    }

    async findById(id) {
        return await Exam.findById(id).exec();
    }

    async findByPersonId(personId) {
        return await Exam.find({ personId }).sort({ createdAt: -1 }).exec();
    }

    async findByPersonIdAndProgramIds(personId, programIds) {
        return await Exam.find({
            personId,
            programId: { $in: programIds }
        }).exec();
    }

    async findOneByPersonIdAndProgramIds(personId, programIds) {
        return await Exam.findOne({
            personId,
            programId: { $in: programIds }
        }).sort({ createdAt: -1 }).exec();
    }

    async aggregatePersonProfile(examId) {
        return await Exam.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(examId) } },
            {
                $lookup: {
                    from: 'persons',
                    localField: 'personId',
                    foreignField: '_id',
                    as: 'personProfile'
                }
            },
            { $unwind: '$personProfile' },
            {
                $project: {
                    _id: 0,
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
    }

    async aggregateInstitution(examId) {
        return await Exam.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(examId) } },
            {
                $lookup: {
                    from: 'programs',
                    localField: 'programId',
                    foreignField: '_id',
                    as: 'program'
                }
            },
            { $unwind: '$program' },
            {
                $lookup: {
                    from: 'institutions',
                    localField: 'program.institutionId',
                    foreignField: '_id',
                    as: 'institution'
                }
            },
            { $unwind: '$institution' },
            {
                $project: {
                    _id: 0,
                    'institution._id': 1,
                    'institution.name': 1,
                    'institution.email': 1,
                    'institution.phoneNumber': 1,
                    'institution.address': 1,
                    'institution.type': 1,
                    'institution.status': 1,
                    'institution.customization': 1
                }
            }
        ]);
    }
}

module.exports = new ExamRepository();
