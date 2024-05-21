const express = require('express');
const router = express.Router();
const languageRouter = require('./language.routes');

router.use('/', languageRouter);



module.exports = router