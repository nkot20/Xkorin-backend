const express = require('express');
const router = express.Router();
const variableRouter = require('./variables.routes');

router.use('/', variableRouter);



module.exports = router