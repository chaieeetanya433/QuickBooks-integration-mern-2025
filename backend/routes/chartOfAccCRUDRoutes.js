const express = require('express');
const router = express.Router();
const {getAccountById, getAllAccounts, getAccountTypes, createAccount, updateAccount, deleteAccount} = require('../controllers/chartOfAccCRUDController');

// Get all accounts with pagination and filtering
router.get('/', getAllAccounts);

// Get account types for filter options
router.get('/types', getAccountTypes);

// Get specific account
router.get('/:id', getAccountById);

// Create new account
router.post('/', createAccount);

// Update existing account
router.put('/:id', updateAccount);

// Delete account (mark as inactive)
router.delete('/:id', deleteAccount);

module.exports = router;