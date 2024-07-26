const express = require('express');
const router = express.Router();
const weightRouter = require('./imprintInstitution.routes');

router.use('/', weightRouter);



module.exports = router