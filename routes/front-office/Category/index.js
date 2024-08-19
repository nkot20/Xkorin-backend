const express = require('express');
const router = express.Router();
const categoryRouter = require('./category.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, categoryRouter);

module.exports = router