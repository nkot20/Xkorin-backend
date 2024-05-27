const express = require('express');
const router = express.Router();
const imprintRouter = require('./Imprints');
const variableRouter = require('./Variables');
const languageRouter = require('./Language');
const authRouter = require('./auth.route');
const questionRouter = require('./Questions');
const propositionRouter = require('./Propositions');
const profilRouter = require('./Profil');

router.use('/imprints', imprintRouter);
router.use('/variable', variableRouter);
router.use('/auth', authRouter);
router.use('/language', languageRouter);
router.use('/question', questionRouter);
router.use('/proposition', propositionRouter);
router.use('/profil', profilRouter);

module.exports = router