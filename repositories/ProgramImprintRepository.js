const Program = require('../models/Program');
const Imprint = require('../models/Imprint');
class ProgramImprintRepository {

    async create(payload) {
        try {
            const program = await Program.findById(payload.programId);
            const imprint = await Imprint.findById(payload.imprintId);
            if (!program)
                throw new Error("Program doesn't exist");
            if (!imprint)
                throw new Error("Imprint doesn't exist");
            return await Imprint.create(payload);
        } catch (error) {
            console.error("Something went to wrong ", error);
            throw error;
        }
    }


    async findImprintByProgramId(programId) {
        try {
            return await Imprint.find({programId});
        } catch (error) {
            console.error("Error creating profil: ", error);
            throw error;
        }
    }

}