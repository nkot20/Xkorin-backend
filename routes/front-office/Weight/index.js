const express = require('express');
const router = express.Router();
const weightRouter = require('./weight.routes');

router.use('/', weightRouter);



module.exports = router