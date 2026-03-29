const express = require('express');
const router = express.Router();
const { getReports, createReport, resolveReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getReports);
router.post('/', protect, createReport);
router.put('/:id/resolve', protect, authorize('admin'), resolveReport);

module.exports = router;
