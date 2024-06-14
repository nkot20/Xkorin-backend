const express = require('express');
const router = express.Router();
const categoryRouter = require('./Category');
const subCategoryRouter = require('./SubCategory');
const profilRouter = require('./Profil');

router.use('/category', categoryRouter);
router.use('/sub-category', subCategoryRouter);
router.use('/profil', profilRouter)

module.exports = router