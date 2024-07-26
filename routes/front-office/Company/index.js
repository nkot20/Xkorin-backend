const express = require('express');
const router = express.Router();
const companyRouter = require('./company.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, companyRouter);

module.exports = router