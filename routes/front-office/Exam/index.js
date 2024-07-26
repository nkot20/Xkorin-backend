const express = require('express');
const router = express.Router();
const examRouter = require('./exam.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, examRouter);

module.exports = router