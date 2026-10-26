const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getSiswa);
router.post('/', studentController.addSiswa);
router.delete('/:id', studentController.deleteSiswa);

module.exports = router;