/*
const { FirebaseScrypt } = require('firebase-scrypt');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Schema } = require('mongoose');
const Roles = require('../config/role');

const UsagerSchema = new mongoose.Schema({
    first_name: {
        type: String,
        // required: true,
    },
    last_name: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        required: false,
    },

    age: {
        type: Number,
        required: false,
    },
    gender: {
        type: String,
    },
    mobile_no: {
        type: String,
        required: false,
    },
    country_code: {
        type: String,
        required: false,
    },
    avatar: {
        type: String,
        default: '',
    },

    function: {
        type: String
    },
    company: {
        type: String
    },
    profil: {
        type: String
    },
    civilite: {
        type: String
    }


}, { timestamps: true });


UsagerSchema.plugin(aggregatePaginate);

const usager = mongoose.model('usager', UsagerSchema);
module.exports = usager;
*/
