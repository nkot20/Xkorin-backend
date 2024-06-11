const express = require('express');
const router = express.Router();
const categoryRouter = require('./category.routes');

router.use('/', categoryRouter);

module.exports = router