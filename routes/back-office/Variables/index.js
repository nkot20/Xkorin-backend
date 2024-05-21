const express = require('express');
const router = express.Router();
const variableRouter = require('./variable.routes');

router.use('/', variableRouter);



module.exports = router