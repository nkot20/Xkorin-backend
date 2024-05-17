const express = require('express');
const router = express.Router();
const questionRouter = require('./question.routes');

router.use('/', questionRouter);



module.exports = router