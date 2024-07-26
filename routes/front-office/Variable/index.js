const express = require('express');
const router = express.Router();
const variableRouter = require('./variables.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, variableRouter);



module.exports = router