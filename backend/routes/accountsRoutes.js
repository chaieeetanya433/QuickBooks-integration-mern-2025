
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// const { validateToken } = require('../middleware/authMiddleware');
const { syncChartOfAccounts } = require('../controllers/accountsController');

// Fetch and store Chart of Accounts
router.get("/", asyncHandler(syncChartOfAccounts));

module.exports = router;