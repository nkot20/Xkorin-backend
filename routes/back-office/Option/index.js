const express = require('express');
const router = express.Router();
const optionRouter = require('./option.routes');

router.use('/', optionRouter);

module.exports = router