const { MongoClient } = require('mongodb');

class MongoClientTransaction {
    constructor() {
        this.client = new MongoClient(process.env.MONGODB_URI, { monitorCommands: true });
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Connexion réussie à la base de données MongoDB');
        } catch (error) {
            console.error('Erreur de connexion à la base de données MongoDB :', error);
            throw error;
        }
    }

    getClient() {
        return this.client;
    }
}

const mongoClientTransaction = new MongoClientTransaction();
//mongoClientTransaction.connect(); // Connecter dès que l'instance est créée

module.exports = mongoClientTransaction;
