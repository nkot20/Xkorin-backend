const express = require('express');
const router = express.Router();
const weightRouter = require('./imprintInstitution.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, weightRouter);



module.exports = router