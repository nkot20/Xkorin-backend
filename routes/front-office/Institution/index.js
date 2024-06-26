const express = require('express');
const router = express.Router();
const institutionRouter = require('./institution.routes');

router.use('/', institutionRouter);



module.exports = router