const express = require('express');
const router = express.Router();
const imprintRouter = require('./Imprints');
const variableRouter = require('./Variables');
const languageRouter = require('./Language');
const authRouter = require('./auth.route');
const questionRouter = require('./Questions');
const propositionRouter = require('./Propositions');
const profilRouter = require('./Profil');
const categoryRouter = require('./Category');
const subCategoryRouter = require('./SubCategory');
const institutionRouter = require('./Institution');
const optionRouter = require('./Option');
const programRouter = require('./Program');

router.use('/imprints', imprintRouter);
router.use('/variable', variableRouter);
router.use('/auth', authRouter);
router.use('/language', languageRouter);
router.use('/question', questionRouter);
router.use('/proposition', propositionRouter);
router.use('/profil', profilRouter);
router.use('/category', categoryRouter);
router.use('/sub-category', subCategoryRouter);
router.use('/institution', institutionRouter);
router.use('/option', optionRouter);
router.use('/program', programRouter);

module.exports = router