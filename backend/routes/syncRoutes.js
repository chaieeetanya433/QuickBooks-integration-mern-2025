const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// const { validateToken } = require('../middleware/authMiddleware');
const { syncAll } = require('../controllers/syncController');

// Sync all data
router.get("/all", asyncHandler(syncAll));

module.exports = router;