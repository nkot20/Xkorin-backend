const Person = require('../models/Person');
const personRepository = require('../repositories/PersonRepository');

jest.mock('../models/Person');

describe('PersonRepository', () => {

    afterEach(() => {
        jest.clearAllMocks(); // Nettoie les mocks après chaque test
    });

    describe('create', () => {
        it('should create a new person', async () => {
            const personData = { name: 'John Doe', email: 'john.doe@example.com' };
            const createdPerson = { _id: '1', ...personData };

            Person.create.mockResolvedValue(createdPerson);

            const result = await personRepository.create(personData);

            expect(Person.create).toHaveBeenCalledWith(personData);
            expect(result).toEqual(createdPerson);
        });

        it('should throw an error if creation fails', async () => {
            const error = new Error('Creation failed');
            Person.create.mockRejectedValue(error);

            await expect(personRepository.create({ name: 'Jane Doe' })).rejects.toThrow('Creation failed');
        });
    });

    describe('findPersonByEmail', () => {
        it('should find a person by email', async () => {
            const email = 'john.doe@example.com';
            const foundPerson = { _id: '1', name: 'John Doe', email };

            Person.findOne.mockResolvedValue(foundPerson);

            const result = await personRepository.findPersonByEmail(email);

            expect(Person.findOne).toHaveBeenCalledWith({ email });
            expect(result).toEqual(foundPerson);
        });

        it('should throw an error if fetching fails', async () => {
            const error = new Error('Fetching failed');
            Person.findOne.mockRejectedValue(error);

            await expect(personRepository.findPersonByEmail('john.doe@example.com')).rejects.toThrow('Fetching failed');
        });
    });

    describe('updatePerson', () => {
        it('should update a person', async () => {
            const personId = '1';
            const updateData = { name: 'John Smith' };
            const updatedPerson = { _id: personId, ...updateData };

            Person.findOneAndUpdate.mockResolvedValue(updatedPerson);

            const result = await personRepository.updatePerson(personId, updateData);

            expect(Person.findOneAndUpdate).toHaveBeenCalledWith({ _id: personId }, updateData, { new: true });
            expect(result).toEqual(updatedPerson);
        });

        it('should throw an error if updating fails', async () => {
            const error = new Error('Update failed');
            Person.findOneAndUpdate.mockRejectedValue(error);

            await expect(personRepository.updatePerson('1', { name: 'Jane Doe' })).rejects.toThrow('Update failed');
        });
    });

});
