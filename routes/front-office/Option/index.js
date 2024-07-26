const express = require('express');
const router = express.Router();
const optionRouter = require('./option.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, optionRouter);

module.exports = router