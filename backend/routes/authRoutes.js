const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler.js');
const { 
    initiateAuth, 
    handleCallback, 
    getApiStatus, 
    getTokenStatus, 
    refreshToken, 
    logout
} = require('../controllers/authController.js');

// Initiate OAuth flow
router.get("/", initiateAuth);

// OAuth callback handler
router.get("/callback", asyncHandler(handleCallback));

// // API Status endpoint
router.get("/api-status", asyncHandler(getApiStatus));

// // Token management endpoints
router.get("/token/status", asyncHandler(getTokenStatus));
router.post("/token/refresh", asyncHandler(refreshToken));

//logout
router.post("/logout", asyncHandler(logout));

module.exports = router;