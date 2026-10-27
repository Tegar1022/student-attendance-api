const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/', attendanceController.inputAbsensi);
router.get('/report', attendanceController.getLaporan);

module.exports = router;