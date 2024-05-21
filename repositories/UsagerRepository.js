const Usager = require('../models/Usager');
const calculPointRepository = require('../repositories/CaculPointRepository');
const Answer = require('../models/Answer');
const Helper = require("../common/Helper");
const fs = require("fs");
class UsagerRepository {

    async getListeUsagersRepondusAuQuizz(quizId, companyId, empreinteId) {
        try {
            // Récupérer les réponses distinctes pour le quiz donné
            const distinctReponses = await Answer.distinct('usagerId', { quizId }).lean();

            // Créer un objet pour stocker le nombre de points de chaque usager
            const pointsUsagers = {};

            // Pour chaque usager ayant répondu au quiz, calculer le nombre de points
            await Promise.all(distinctReponses.map(async (usagerId) => {
                // Calculer le nombre de points pour cet usager en utilisant la fonction calculFinalPoint
                const points = await calculPointRepository.calculImprintUser(usagerId, companyId, empreinteId, quizId);
                pointsUsagers[usagerId] = points;
            }));

            // Récupérer les informations de chaque usager et ajouter le nombre de points
            const usagersAvecPoints = await Promise.all(distinctReponses.map(async (usagerId) => {
                // Récupérer les informations de l'usager
                const usager = await Usager.findById(usagerId).lean();
                Helper.generateQrCode({
                    date: this.formatDate(new Date()),
                    nom: usager.civilite +' '+ usager.first_name+' '+usager.last_name,
                    formation: usager.title,
                    points: pointsUsagers[usagerId]
                }, usager._id, quizId);
                Helper.exportWebsiteAsPdf({
                    date: this.formatDate(new Date()),
                    dateExpiration: this.formatDate(this.addYearsToDate(new Date(),1)),
                    lastname: usager.civilite + ' '+usager.last_name,
                    firstname: usager.first_name,
                    formation: usager.title,
                    points: Math.floor(pointsUsagers[usagerId]),
                    qrcode: this.imageFileToBase64('./public/qrcode/'+quizId+'_'+usager._id+'.png'),
                    logoentetegauche: this.imageFileToBase64('./public/logos/accelerate-africa.jpg'),
                    logoentetedroit: this.imageFileToBase64('./public/logos/wellbin.PNG'),
                    diamantlogo: this.imageFileToBase64('./public/logos/diamant_logo.jpg'),
                    humanbetlogo: this.imageFileToBase64('./public/logos/humanbet_logo.jpg'),
                    mmlogo: this.imageFileToBase64('./public/logos/mm_logo.jpg'),
                    signature1: this.imageFileToBase64('./public/logos/signaturebossou.PNG'),
                    signature2: this.imageFileToBase64('./public/logos/signaturemondo.PNG'),
                }, quizId, usager._id).then(value => {
                    console.log(value)
                })
                // Renvoyer l'usager avec le nombre de points
                return {
                    ...usager,
                    points: Math.floor(pointsUsagers[usagerId]) || 0 // Si l'usager n'a pas de points calculés, mettre 0
                };
            }));
            console.log(usagersAvecPoints)
            return usagersAvecPoints;
        } catch (error) {
            console.error("Une erreur est survenue lors de la récupération de la liste des usagers:", error);
            return [];
        }
    }

    async getUsagerDetailsRepondusAuQuizz(quizId, usagerId, companyId, empreinteId) {
        try {
            // Récupérer les informations de l'usager
            const usager = await Usager.findById(usagerId).lean();
            // Créer un objet pour stocker le nombre de points de chaque usager
            const points = await calculPointRepository.calculImprintUser(usagerId, companyId, empreinteId, quizId);
            return {
                ...usager,
                points: Math.floor(points) || 0 // Si l'usager n'a pas de points calculés, mettre 0
            };
        } catch (error) {
            console.error("Une erreur est survenue lors de la récupération de la liste des usagers:", error);
            return [];
        }
    }

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    addYearsToDate(date, yearsToAdd) {
        const newDate = new Date(date); // Crée une copie de la date d'origine
        newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Ajoute le nombre d'années spécifié
        return newDate;
    }

    imageFileToBase64(filePath) {
        try {
            // Lire le fichier image depuis le chemin relatif
            const imageData = fs.readFileSync(filePath);

            // Convertir les données en base64
            const base64 = Buffer.from(imageData).toString('base64');
            console.log(base64)
            return base64;
        } catch (error) {
            console.error('Erreur lors de la conversion de l\'image en base64 :', error.message);
            return null;
        }
    }

}

const usagerRepository = new UsagerRepository();
module.exports = usagerRepository;