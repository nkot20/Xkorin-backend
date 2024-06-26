const express = require('express');
const router = express.Router();
const examRouter = require('./exam.routes');

router.use('/', examRouter);

module.exports = router