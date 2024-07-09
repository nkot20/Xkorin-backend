const express = require('express');
const router = express.Router();
const categoryRouter = require('./Category');
const subCategoryRouter = require('./SubCategory');
const profilRouter = require('./Profil');
const imprintRouter = require('./Imprint');
const institutionRouter = require('./Institution');
const examRouter = require('./Exam');
const optionRouter = require('./Option');
const answerRouter = require('./Answer');
const userRouter = require('./User');
const companyRouter = require('./Company');


router.use('/category', categoryRouter);
router.use('/sub-category', subCategoryRouter);
router.use('/profil', profilRouter);
router.use('/imprint', imprintRouter);
router.use('/institution', institutionRouter);
router.use('/exam', examRouter);
router.use('/option', optionRouter);
router.use('/answer', answerRouter);
router.use('/user', userRouter);
router.use('/company', companyRouter);

module.exports = router