const pdf = require("pdf-creator-node");
const fs = require("fs");
// Read HTML Template
const template = fs.readFileSync("templates/Certificat/page.html", "utf8");
const QRCode = require('qrcode');
const mustache = require("mustache");
const axios = require('axios');
const puppeteer = require('puppeteer');



QRCode.toFile('./public/qrcode.png', 'Test coco', {
    errorCorrectionLevel: 'H',
    width: 150, // Largeur en pixels
    height: 150 // Hauteur en pixels
}, function(err) {
    if (err) throw err;
    console.log('QR code saved!');
});


function printCertificatTrainingImprint(datas) {
    try {

        const html = mustache.render(template, datas);
        let document = {
            html: html,
            data: {
                user: datas,
            },
            path: "./public/certificats/formation/test.pdf",
            type: "",
        };
        const options = {
            format: "A4",
            orientation: "portrait",
            border: "1mm",
            header: {
                height: "5mm",
            },
            footer: {
                height: "5mm",
            }
        };
        pdf
            .create(document, options)
            .then((res) => {
                console.log(res);
            })
            .catch((error) => {
                console.error(error);
            });
    } catch (error) {
        throw error;
    }
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function addYearsToDate(date, yearsToAdd) {
    const newDate = new Date(date); // Crée une copie de la date d'origine
    newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Ajoute le nombre d'années spécifié
    return newDate;
}
/*printCertificatTrainingImprint({
    date: formatDate(new Date()),
    dateExpiration: formatDate(addYearsToDate(new Date(),1)),
    lastname: "NKOT-A-NZOK ",
    firstname: "ETIENNE",
    formation: "Formation en entrepreneuriat",
    points: Math.floor(187.2555),
    qrcode: 'http://localhost:4002/qrcode/660d25b29a9135d349467bb8_6612c6cf292f7856070a4e49.png',
    logoentetegauche: 'http://localhost:4002/logos/accelerate-africa.PNG',
    logoentetedroit: 'http://localhost:4002/logos/wellbin.PNG',
    diamantlogo: 'http://localhost:4002/logos/diamant_logo.jpg',
    humanbetlogo: 'http://localhost:4002/logos/humanbet_logo.jpg',
    mmlogo: 'http://localhost:4002/logos/mm_logo.jpg',
    signature1: 'http://localhost:4002/logos/signaturebossou.PNG',
    signature2: 'http://localhost:4002/logos/signaturemondo.PNG',
});*/


async function exportWebsiteAsPdf(data, outputPath) {
    const html = mustache.render(template, data);
    // Create a browser instance
    const browser = await puppeteer.launch({
        headless: 'new'
    });

    // Create a new page
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('img', { timeout: 20000 });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Download the PDF
    const PDF = await page.pdf({
        path: outputPath,
        margin: { top: '5px', right: '0px', bottom: '5px', left: '0px' },
        printBackground: true,
        format: 'A4',
    });

    // Close the browser instance
    await browser.close();

    return PDF;
}

 exportWebsiteAsPdf({
    date: formatDate(new Date()),
    dateExpiration: formatDate(addYearsToDate(new Date(),1)),
    lastname: "NKOT-A-NZOK ",
    firstname: "ETIENNE",
    formation: "Formation en entrepreneuriat",
    points: Math.floor(187.2555),
    qrcode: imageFileToBase64('./public/qrcode/660d25b29a9135d349467bb8_6612c6cf292f7856070a4e49.png'),
    logoentetegauche: imageFileToBase64('./public/logos/accelerate-africa.jpg'),
    logoentetedroit: imageFileToBase64('./public/logos/wellbin.PNG'),
    diamantlogo: imageFileToBase64('./public/logos/diamant_logo.jpg'),
    humanbetlogo: imageFileToBase64('./public/logos/humanbet_logo.jpg'),
    mmlogo: imageFileToBase64('./public/logos/mm_logo.jpg'),
    signature1: imageFileToBase64('./public/logos/signaturebossou.PNG'),
    signature2: imageFileToBase64('./public/logos/signaturemondo.PNG'),
}, "./public/certificats/formation/test.pdf").then(value => {
     console.log(value)
 })

function imageFileToBase64(filePath) {
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