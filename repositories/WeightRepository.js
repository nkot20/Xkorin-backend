require('dotenv').config();
const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
const Weight = require("../models/Weight");

class WeightRepository {

    async create (payload) {
        try {
           return await Weight.create(payload);
        } catch (error) {
            throw error;
        }
    }



}

const weightRepository = new WeightRepository();
module.exports = weightRepository;