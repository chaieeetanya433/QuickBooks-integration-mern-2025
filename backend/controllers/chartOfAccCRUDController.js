const ChartOfAccount = require('../models/ChartOfAccount');
const { setupOAuthClient } = require('../utils/helper');

/**
 * Get all Chart of Accounts
 */
const getAllAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'Name', order = 'asc', search = '', accountType = '' } = req.query;

        // Build filter
        const filter = {};
        if (search) {
            filter.Name = { $regex: search, $options: 'i' };
        }
        if (accountType) {
            filter.AccountType = accountType;
        }

        // Count total records for pagination
        const total = await ChartOfAccount.countDocuments(filter);

        // Get paginated and sorted records
        const accounts = await ChartOfAccount.find(filter)
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            accounts
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve accounts',
            error: error.message
        });
    }
};

/**
 * Get account by ID
 */
const getAccountById = async (req, res) => {
    try {
        const account = await ChartOfAccount.findOne({ Id: req.params.id });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        res.json({
            success: true,
            account
        });
    } catch (error) {
        console.error('Error fetching account by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve account',
            error: error.message
        });
    }
};

/**
 * Create a new account both locally and in QuickBooks
 */
const createAccount = async (req, res) => {
    try {
        const accountData = req.body;
        // Basic validation
        if (!accountData.Name || !accountData.AccountType) {
            return res.status(400).json({
                success: false,
                message: 'Name and AccountType are required fields'
            });
        }

        // First create in QuickBooks
        const { oauthClient, realmId } = await setupOAuthClient();

        const qboResponse = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/account`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // body: JSON.stringify({
            //     Name: accountData.Name,
            //     AccountType: accountData.AccountType,
            //     AccountSubType: accountData.AccountSubType || undefined,
            //     Classification: accountData.Classification || undefined,
            //     Description: accountData.Description || undefined,
            //     Active: accountData.Active !== undefined ? accountData.Active : true
            // })
            body: JSON.stringify({
                Name: accountData.Name,
                AccountType: accountData.AccountType,
                // AccountSubType: accountData.AccountSubType || undefined,
                // Active: accountData.Active !== undefined ? accountData.Active : true
            })
        });

        // Extract created account from response
        const createdQBAccount = qboResponse.json.Account;

        // Then save to our local database
        const newAccount = new ChartOfAccount(createdQBAccount);
        const savedAccount = await newAccount.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            account: savedAccount
        });
    } catch (error) {
        console.error('Error creating account:', error);
        console.error('QuickBooks error response:', error.response?.data);
        res.status(500).json({
            success: false,
            message: 'Failed to create account',
            error: error.message,
            qboError: error.intuit_tid ? {
                intuit_tid: error.intuit_tid,
                statusCode: error.statusCode,
                detail: error.json?.Fault?.Error?.[0]?.Detail
            } : undefined
        });
    }
};

/**
 * Update an account both locally and in QuickBooks
 */
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // First check if account exists locally
        const existingAccount = await ChartOfAccount.findOne({ Id: id });
        if (!existingAccount) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Update in QuickBooks first
        const { oauthClient, realmId } = await setupOAuthClient();

        // Need to include QuickBooks sync token to prevent conflicts
        const {
            AccountSubType,
            AccountType,
            Active,
            Classification,
            CurrencyRef,
            CurrentBalance,
            CurrentBalanceWithSubAccounts,
            FullyQualifiedName,
            MetaData,
            Name,
            SubAccount
        } = updateData;
        
        const updatePayload = {
            Id: id,
            SyncToken: existingAccount.SyncToken,
            AccountSubType,
            AccountType,
            Active,
            Classification,
            CurrencyRef,
            CurrentBalance,
            CurrentBalanceWithSubAccounts,
            FullyQualifiedName,
            MetaData,
            Name,
            SubAccount
        };
              

        console.log(updatePayload, 'updatePayload');

        const qboResponse = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/account`,
            method: 'POST', // QuickBooks uses POST for updates too
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        // Extract updated account from response
        const updatedQBAccount = qboResponse.json.Account;

        // Update local database
        const updatedAccount = await ChartOfAccount.findOneAndUpdate(
            { Id: id },
            updatedQBAccount,
            { new: true }
        );

        res.json({
            success: true,
            message: 'Account updated successfully',
            account: updatedAccount
        });

        if (qboResponse.status >= 400) {
            const errJson = await qboResponse.json();
            console.error('QuickBooks error:', JSON.stringify(errJson, null, 2));
        }
        
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update account',
            error: error.message,
            qboError: error.intuit_tid ? {
                intuit_tid: error.intuit_tid,
                statusCode: error.statusCode,
                detail: error.json?.Fault?.Error?.[0]?.Detail
            } : undefined
        });
    }
};

/**
 * Delete an account (mark as inactive) both locally and in QuickBooks
 */
/**
 * Delete an account (mark as inactive) both locally and in QuickBooks
 */
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if account exists locally
        const existingAccount = await ChartOfAccount.findOne({ Id: id });
        console.log(existingAccount, 'existingAccount');
        if (!existingAccount) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // In QuickBooks, you need to send the complete account object with Active set to false
        const { oauthClient, realmId } = await setupOAuthClient();

        // First get the latest account data from QuickBooks to ensure we have the current SyncToken
        const getResponse = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/account/${id}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Get the current account data from QuickBooks
        const currentAccount = getResponse.json.Account;

        // Prepare the update payload - include all required fields
        const updatePayload = {
            ...currentAccount,          // Include all existing fields
            Active: false,              // Set Active to false
            sparse: true                // Use sparse update (only update specified fields)
        };

        // Log the payload for debugging
        console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

        // Make the API call to update the account
        const updateResponse = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/account`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        // Update local record to mark as inactive
        await ChartOfAccount.findOneAndUpdate(
            { Id: id },
            { Active: false }
        );

        res.json({
            success: true,
            message: 'Account marked as inactive successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);

        // Enhanced error handling for better debugging
        let errorDetails = {
            message: error.message
        };

        // Extract QuickBooks API error details if available
        if (error.response && error.response.data && error.response.data.Fault) {
            errorDetails.qboError = {
                code: error.response.data.Fault.Error?.[0]?.code,
                message: error.response.data.Fault.Error?.[0]?.Message,
                detail: error.response.data.Fault.Error?.[0]?.Detail,
                intuit_tid: error.response.headers?.intuit_tid
            };

            // Special handling for common error cases
            if (error.response.data.Fault.Error?.[0]?.code === '6000') {
                errorDetails.userMessage = 'This account cannot be deactivated because it is being used in transactions.';
            }
        }

        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to delete account',
            error: errorDetails
        });
    }
};

/**
 * Get account types for filtering
 */
const getAccountTypes = async (req, res) => {
    try {
        // Find distinct account types
        const accountTypes = await ChartOfAccount.distinct('AccountType');

        res.json({
            success: true,
            accountTypes
        });
    } catch (error) {
        console.error('Error fetching account types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve account types',
            error: error.message
        });
    }
};

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountTypes
};