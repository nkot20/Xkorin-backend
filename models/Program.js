const mongoose = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { Schema } = mongoose;

const programSchema = Schema({
    institutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
    name: {
        type: String,
        required: true,
    },
    archived: {
       type: Boolean,
       default: false,
    },
    amount: {
        type: Number,
        default: 0
    },
    numberOfParticipants: {
        type: Number,
        default: 0
    },
    code: {
        type: String,
    },
    targetInstitutionId: { type: Schema.Types.ObjectId, ref: 'institutions' },
}, { timestamps: true });

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    return result;
}

programSchema.pre('save', async function (next) {
    if (!this.code) {
        let uniqueCode = generateRandomString(10);
        const count = await this.constructor.countDocuments({ code: uniqueCode });
        if (count === 0) {
            this.code = uniqueCode;
        } else {
            while (true) {
                uniqueCode = generateRandomString(10);
                const newCount = await this.constructor.countDocuments({ code: uniqueCode });
                if (newCount === 0) {
                    this.code = uniqueCode;
                    break;
                }
            }
        }
    }
    next();
});
programSchema.plugin(aggregatePaginate);
const Program = mongoose.model('program', programSchema);

module.exports = Program;
