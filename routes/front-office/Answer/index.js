const express = require('express');
const router = express.Router();
const answerRouter = require('./answer.routes');

router.use('/', answerRouter);

module.exports = router