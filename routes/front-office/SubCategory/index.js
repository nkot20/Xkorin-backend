const express = require('express');
const router = express.Router();
const subCategoryRouter = require('./subcategory.routes');

router.use('/', subCategoryRouter);

module.exports = router