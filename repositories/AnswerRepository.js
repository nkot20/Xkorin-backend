require('dotenv').config();
const Answer = require('../models/Answer');
const Usager = require('../models/Usager');
const Quiz = require('../models/Exam');
const calculPointRepository = require('../repositories/CaculPointRepository');
const {ObjectId} = require("mongodb");
const Helper = require('../common/Helper');


class AnswerRepository {

    async create(usager, propositions, quizId) {
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz doesn\'t exist !');
            }
            let resultUsager = await Usager.findOne({email: usager.email});
            if (!resultUsager) {
                resultUsager =  await Usager.create(usager);
            }
            let datas = [];
            propositions.forEach((value) => {
                datas.push({
                    propositionId: new ObjectId(value.id),
                    usagerId: resultUsager._id,
                    quizId: new ObjectId(quizId),
                    value: value.value
                })
            })
            console.log(datas)


            const promises = datas.map(async (value) => {
                console.log("Creating Answer with value:", value);
                return await Answer.create(value);
            });
            const answers = await Promise.all(promises);
            let quizzInfos = await Quiz.findById(quizId);
            let points = await calculPointRepository.calculImprintUser(resultUsager._id, quiz.companyId, '660ef07d12bd44b5e6ae8085',quizId);
            Helper.generateQrCode({
                date: this.formatDate(new Date()),
                nom: resultUsager.civilite +' '+ resultUsager.first_name+' '+resultUsager.last_name,
                formation: quizzInfos.title,
                points: points
            }, resultUsager._id, quizId);
            await Helper.exportWebsiteAsPdf({
                date: this.formatDate(new Date()),
                dateExpiration: this.formatDate(this.addYearsToDate(new Date(),1)),
                lastname: resultUsager.civilite + ' '+resultUsager.last_name,
                firstname: resultUsager.first_name,
                formation: quizzInfos.title,
                points: Math.floor(points),
                qrcode: process.env.HOSTNAME+'/qrcode/'+quizId+'_'+resultUsager._id+'.png',
                logoentetegauche: process.env.HOSTNAME+'/logos/accelerate-africa.jpg',
                logoentetedroit: process.env.HOSTNAME+'/logos/wellbin.PNG',
                diamantlogo: process.env.HOSTNAME+'/logos/diamant_logo.jpg',
                humanbetlogo: process.env.HOSTNAME+'/logos/humanbet_logo.jpg',
                mmlogo: process.env.HOSTNAME+'/logos/mm_logo.jpg',
                signature1: process.env.HOSTNAME+'/logos/signaturebossou.PNG',
                signature2: process.env.HOSTNAME+'/logos/signaturemondo.PNG',
            }, quizId, resultUsager._id)
            return points;
        } catch (error) {
            console.error(error)
            throw error;
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

}

const answerRepository = new AnswerRepository();
module.exports = answerRepository;