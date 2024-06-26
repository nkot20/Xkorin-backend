const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['radio', 'checkbox'],
        required: true,
    },
    weighting: { /// to know if question is an exam question with points or it's just to get information (factor weight or information)
        type: Boolean,
        default: false,
    },
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'variables' },
    profilId: { type: mongoose.Schema.Types.ObjectId, ref: 'profils' }
}, { timestamps: true });

const question = mongoose.model('question', questionSchema);

module.exports = question;
