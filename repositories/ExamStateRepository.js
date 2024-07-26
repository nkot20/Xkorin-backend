require('dotenv').config();
const ExamState = require('../models/ExamState');
class ExamStateRepository {
    /**
     *
     * @param payload
     * @returns {Promise<any>}
     */
    async create(payload) {
        try {
            const examState = await ExamState.findOne({variableId: payload.id, examId: payload.examId})
            if (examState)
                return null;
            return await ExamState.create(payload);
        } catch (error) {
            throw error;
        }
    }
}