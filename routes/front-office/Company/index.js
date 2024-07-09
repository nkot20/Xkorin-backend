const express = require('express');
const router = express.Router();
const companyRouter = require('./company.routes');

router.use('/', companyRouter);

module.exports = router