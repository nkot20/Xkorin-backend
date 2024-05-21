const express = require('express');
const router = express.Router();
const propositionRouter = require('./propositions.routes');

router.use('/', propositionRouter);

module.exports = router