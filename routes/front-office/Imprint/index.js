const express = require('express');
const router = express.Router();
const imprintRouter = require('./imprint.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, imprintRouter);



module.exports = router