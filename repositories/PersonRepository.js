const Person = require('../models/Person');
const jwt = require("jsonwebtoken");

class PersonRepository {

    async create(datas) {
        try {
            return await Person.create(datas);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async findPersonByEmail(email){
        try {
            return await Person.findOne({email});
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const personRepository = new PersonRepository();
module.exports = personRepository;