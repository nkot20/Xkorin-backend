const express = require('express');
const router = express.Router();
const profilRouter = require('./profil.routes');

router.use('/', profilRouter);



module.exports = router