const express = require('express');
const router = express.Router();

const backOfficeRoutes = require('./back-office');

router.use('/back-office', backOfficeRoutes);


module.exports = router;