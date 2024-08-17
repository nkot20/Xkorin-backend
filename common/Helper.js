const bcrypt = require('bcryptjs');
const base64Img = require('base64-img');
const config = require('../config/config.js');
//Required package
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require('path');
// Read HTML Template
const templateCertificat = fs.readFileSync("./templates/Certificat/page.html", "utf8");
const templateDashboard = fs.readFileSync("./templates/Dashboard/imprint-dashboard.html", "utf8");
const QRCode = require('qrcode');
const mustache = require('mustache')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

module.exports = class Helper {
  static async apiSuccessResponse(data, message = '') {
    return {
      success: true,
      data,
      message,
    };
  }

  static async apiErrorResponse(data, message = '') {
    return {
      success: false,
      data,
      message,
    };
  }

  static async passwordCompare(oldPassword, newPassword) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const match = await bcrypt.compare(newPassword, oldPassword);
      resolve(match);
    });
  }

  static async passwordHashValue(password) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      bcrypt.hash(password, config.saltRounds, async (err, hash) => {
        if (err) {
          reject(err);
        } else {
          console.log('err');
          resolve(hash);
        }
      });
    });
  }

  static async generateCode() {
    try {
      const uniqueCode = `_${Math.random().toString(36).substr(2, 9)}`;
      return uniqueCode;
    } catch (error) {
      console.log(`Could not fetch Admin Email ${error}`);
      throw error;
    }
  }

  static async imageUpload(image, directory, imageName, imageType) {
    const aPromise = new Promise((resolve, reject) => {
      try {
        base64Img.img(
          image,
          directory,
          imageName,
          async (err) => {
            if (err) {
              console.log('profile image upload error ', err);
              reject(err);
            } else {
              const uploadedImageName = `${imageName}.${imageType}`;
              resolve(uploadedImageName);
            }
          },
        );
      } catch (error) {
        reject(error);
      }
    });
    return aPromise;
  }

  static async deleteFile(filepath) {
    return new Promise((resolve, reject) => {
      try {
        fs.stat(filepath, (err, stats) => {
          console.log(stats);// here we got all information of file in stats variable

          if (err) {
            reject('file deleted error');
            return console.error(err);
          }

          fs.unlink(filepath, (err) => {
            if (err) {
              reject('file deleted error');
              return console.log(err);
            }
            console.log('file deleted successfully');
            resolve('file deleted successfully');
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async paginator(items, currentPage, perPageItems) {
    const page = currentPage || 1;
    const perPage = perPageItems || 4;
    const offset = (page - 1) * perPage;

    const paginatedItems = items.slice(offset).slice(0, perPageItems);
    const totalPages = Math.ceil(items.length / perPage);

    return {
      page,
      per_page: perPage,
      pre_page: page - 1 ? page - 1 : null,
      next_page: (totalPages > page) ? page + 1 : null,
      total: items.length,
      total_pages: totalPages,
      data: paginatedItems,
      totalDocs: items.length,
    };
  }

  static printCertificatTrainingImprint(datas, idQuiz, idUsager) {
    try {
      const html = mustache.render(templateCertificat, datas);
      let document = {
        html: html,
        data: {
          user: datas,
        },
        path: "./public/certificats/formation/"+idQuiz+"_"+idUsager+".pdf",
        type: "",
      };
      const options = {
        format: "A4",
        orientation: "portrait",
        border: "1mm",
        header: {
          height: "10mm",
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

  static generateQrCode(datas, personId, examId, imprint) {
    const directoryPath = 'public/qrcode/'+ imprint + '_' +examId+'_'+personId+'.png';

    if (fs.existsSync(directoryPath)){
      return;
    }
    QRCode.toFile('public/qrcode/'+ imprint + '_' +examId+'_'+personId+'.png', JSON.stringify(datas), {
      errorCorrectionLevel: 'H',
      width: 150,
      height: 150
    }, function(err) {
      if (err) throw err;
      console.log('QR code saved!');
    });
  }

  static async exportCertificatExamAsPdf(data, examId, imprint, personId) {
    try {
      this.generateQrCode({
        date: data.date,
        nom: data.name,
        formation: data.formation,
        score: data.points + '/1216'
      }, personId, examId, imprint.name);
      const directoryPath = "public/certificats/imprints/"+examId;

      if (!fs.existsSync(directoryPath)){
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      const html = mustache.render(templateCertificat, data);
      // Create a browser instance
      const browser = await puppeteer.launch({
        headless: 'new'
      });

      // Create a new page
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('img', { timeout: 30000 });

      // To reflect CSS used for screens instead of print
      await page.emulateMediaType('screen');

      //this.createDirectoryIfNotExistsSync(directoryPath);
      // Download the PDF
      const PDF = await page.pdf({
        path: directoryPath + "/" +imprint+ ".pdf",
        margin: { top: '5px', right: '10px', bottom: '5px', left: '10px' },
        printBackground: true,
        format: 'A4',
      });

      // Close the browser instance
      await browser.close();

      return PDF;
    } catch (error) {
      throw error;
    }
  }

  static createSquares(value) {
    const totalSquares = 7;
    const squareData = [];
    for (let i = 0; i < totalSquares; i++) {
      if (i < totalSquares - value) {
        squareData.push({ class: 'gray', star: '' });
      } else {
        let className = '';
        let star = '';
        switch (value) {
          case 7:
            className = 'green star';
            star = '★';
            break;
          case 6:
            className = 'green';
            break;
          case 5:
            className = 'green-white';
            break;
          case 4:
            className = 'orange';
            break;
          case 3:
            className = 'grow';
            break;
          case 2:
            className = 'grow-white';
            break;
          case 1:
            className = 'red';
            break;
        }
        squareData.push({ class: className, star: star });
      }
    }
    console.log()
    return squareData;
  }

  static addPositionClasses(variables) {
    return variables.forEach((variable, index) => {
      variable.isOdd = (index % 2 !== 0);
      variable.isEven = (index % 2 === 0);
    });
  }



  static async exportDashboardExamAsPdf(data, examId, imprint) {
    try {
      // Définir les fonctions de calcul

      // Préparer les données
      data.variables.forEach(variable => {
        variable.children.forEach(child => {
          child.squares = this.createSquares(child.value)
        });
        variable.progressBarHeight = ((variable.children.length * 100)/2);
        variable.progressHeight = ((variable.value * 100) / 7);
      });
      this.addPositionClasses(data.variables);
      // Vérifiez le nombre d'enfants de la première variable
      if (data.variables.length > 0 && data.variables[0].children.length > 6) {
        data.variables[data.variables.length - 2].newPage = true;
        data.variables[data.variables.length - 1].newPage = true;
      }
      // Rendre le template Mustache avec les données préparées
      const html = mustache.render(templateDashboard, data);

      const directoryPath = "public/dashboard/" + examId;
      fs.mkdirSync(directoryPath, { recursive: true });

      // Créer une instance de navigateur
      const browser = await puppeteer.launch({
        headless: 'new'
      });

      // Créer une nouvelle page
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      //await page.waitForSelector('img', { timeout: 120000 });

      // Pour refléter le CSS utilisé pour les écrans au lieu de l'impression
      await page.emulateMediaType('screen');

      // Télécharger le PDF
      const PDF = await page.pdf({
        path: "public/dashboard/" + examId + "/" + imprint + ".pdf",
        margin: { top: '5px', right: '10px', bottom: '5px', left: '10px' },
        printBackground: true,
        format: 'A4',
      });

      // Fermer l'instance du navigateur
      await browser.close();

      return PDF;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert an image file to a Base64 encoded string.
   * @param {string} filePath - Path to the image file.
   * @return {Promise<string>} - A promise that resolves to the Base64 string.
   */
  static imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(err);
        }
        // Convert binary data to base64
        const base64Image = data.toString('base64');
        resolve(base64Image);
      });
    });
  }

  /**
   * Fonction pour combiner des PDF en un seul fichier
   * @param {string} pdfDirCertificat - Chemin du répertoire contenant les fichiers PDF à combiner
   * @param {string} outputFilePath - Chemin du fichier PDF combiné à générer
   */
  static async combinePdfs(pdfDirCertificat,pdfDirDashboard,  outputFilePath) {
    try {

      // Lire tous les fichiers du répertoire
      const filesCertificates = await fs.promises.readdir(pdfDirCertificat);
      const filesDashboard = await fs.promises.readdir(pdfDirDashboard);
      // Filtrer pour obtenir uniquement les fichiers PDF
      const pdfPathsCertificates = filesCertificates.filter(file => path.extname(file).toLowerCase() === '.pdf')
          .map(file => path.join(pdfDirCertificat, file));
      const pdfPathsDashboards = filesDashboard.filter(file => path.extname(file).toLowerCase() === '.pdf')
          .map(file => path.join(pdfDirDashboard, file));
      if (pdfPathsCertificates.length === 0) {
        throw new Error('Aucun fichier PDF trouvé dans le répertoire spécifié.');
      }

      const pdfPaths = [...pdfPathsCertificates, ...pdfPathsDashboards]
      // Créer un nouveau document PDF combiné
      const combinedPdf = await PDFDocument.create();

      for (const pdfPath of pdfPaths) {
        // Lire chaque fichier PDF
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => combinedPdf.addPage(page));
      }

      // Enregistrer le document PDF combiné
      const combinedPdfBytes = await combinedPdf.save();
      fs.writeFileSync(outputFilePath, combinedPdfBytes);

      console.log('PDF combiné avec succès !');
    } catch (error) {
      console.error('Erreur lors de la combinaison des PDF :', error);
    }
  }

  /**
   * Fonction pour créer un dossier si nécessaire (version synchrone)
   * @param {string} dirPath - Chemin du dossier à créer
   */
   static createDirectoryIfNotExistsSync =(dirPath) => {
    try {
      console.log(`Vérification de l'existence du répertoire : ${dirPath}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Répertoire créé avec succès : ${dirPath}`);
      } else {
        console.log(`Le répertoire existe déjà : ${dirPath}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création du répertoire : ${error.message}`);
    }
  }

  static imageFileToBase64(filePath) {
    try {
      // Lire le fichier image depuis le chemin relatif
      const imageData = fs.readFileSync(filePath);

      // Convertir les données en base64
      return Buffer.from(imageData).toString('base64');
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'image en base64 :', error.message);
      return null;
    }
  }

  static formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  static addYearsToDate(date, yearsToAdd) {
    const newDate = new Date(date); // Crée une copie de la date d'origine
    newDate.setFullYear(newDate.getFullYear() + yearsToAdd); // Ajoute le nombre d'années spécifié
    return newDate;
  }


};
