const express = require('express');
const router = express.Router();
const categoryRouter = require('./Category');
const subCategoryRouter = require('./SubCategory');
const profilRouter = require('./Profil');
const imprintRouter = require('./Imprint');
const institutionRouter = require('./Institution');
const examRouter = require('./Exam');
const optionRouter = require('./Option');


router.use('/category', categoryRouter);
router.use('/sub-category', subCategoryRouter);
router.use('/profil', profilRouter);
router.use('/imprint', imprintRouter);
router.use('/institution', institutionRouter);
router.use('/exam', examRouter);
router.use('/option', optionRouter);

module.exports = router