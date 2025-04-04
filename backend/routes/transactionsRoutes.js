const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler.js');
// const { validateToken } = require('../middleware/authMiddleware');
const { syncTransactions } = require('../controllers/transactionsController.js');

// Fetch and store Transactions
router.get("/", asyncHandler(syncTransactions));

module.exports = router;