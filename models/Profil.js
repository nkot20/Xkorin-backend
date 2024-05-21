const mongoose = require('mongoose');
const { Schema } = mongoose;

const profilSchema = Schema({
    label: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const profil = mongoose.model('profil', profilSchema);

module.exports = profil;
