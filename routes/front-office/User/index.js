const express = require('express');
const router = express.Router();
const userRouter = require('./user.routes');
const authMiddleware = require('../../../middlewares/authenticate.middleware');

router.use('/', authMiddleware.authenticate, userRouter);



module.exports = router