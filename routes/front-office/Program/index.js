const express = require('express');
const router = express.Router();
const programRouter = require('./program.routes');

router.use('/', programRouter);



module.exports = router