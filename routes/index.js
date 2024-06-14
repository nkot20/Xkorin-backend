const express = require('express');
const router = express.Router();

const backOfficeRoutes = require('./back-office');
const frontOfficeRoutes = require('./front-office');
const authRouter = require('./auth.route');

router.use('/back-office', backOfficeRoutes);
router.use('/front-office', frontOfficeRoutes);
router.use('/auth', authRouter);

module.exports = router;