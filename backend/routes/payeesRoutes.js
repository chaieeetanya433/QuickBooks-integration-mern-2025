const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler.js');
// const { validateToken } = require('../middleware/authMiddleware');
const { syncPayees } = require('../controllers/payeesController.js');

// Fetch and store Payees
router.get("/", asyncHandler(syncPayees));

module.exports = router;