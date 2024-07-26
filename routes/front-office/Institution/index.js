const express = require('express');
const router = express.Router();
const institutionRouter = require('./institution.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, institutionRouter);



module.exports = router