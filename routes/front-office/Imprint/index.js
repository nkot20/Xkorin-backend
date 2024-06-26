const express = require('express');
const router = express.Router();
const imprintRouter = require('./imprint.routes');

router.use('/', imprintRouter);



module.exports = router