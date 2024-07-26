const express = require('express');
const router = express.Router();
const programRouter = require('./program.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, programRouter);



module.exports = router