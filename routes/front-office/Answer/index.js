const express = require('express');
const router = express.Router();
const answerRouter = require('./answer.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, answerRouter);

module.exports = router