const ChartOfAccount = require('../models/ChartOfAccount');
const { setupOAuthClient } = require('../utils/helper');
// const { getApiBase } = require('../config/oauth');

/**
 * Sync Chart of Accounts from QuickBooks to local database
 */
const syncChartOfAccounts = async (req, res) => {
    try {
        const { oauthClient, realmId } = await setupOAuthClient();

        const response = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/text',
                'Accept': 'application/json'
            },
            body: 'SELECT * FROM Account'
        });

        const accounts = response.json.QueryResponse.Account || [];
        const results = [];
        const errors = [];

        // Log a sample account to see its structure
        // if (accounts.length > 0) {
        //     console.log("Sample Account structure:", JSON.stringify(accounts[0], null, 2));
        // }

        // Use bulkWrite for better performance with improved filtering
        const operations = accounts
            .filter(account => account.Id && typeof account.Id === 'string' && account.Id.trim() !== '')
            .map(account => ({
                updateOne: {
                    filter: { Id: account.Id },
                    update: account,
                    upsert: true
                }
            }));

        if (operations.length > 0) {
            try {
                const bulkResult = await ChartOfAccount.bulkWrite(operations, { ordered: false });
                results.push({
                    matched: bulkResult.matchedCount,
                    modified: bulkResult.modifiedCount,
                    upserted: bulkResult.upsertedCount
                });
            } catch (bulkError) {
                // Handle partial success in bulk operations
                if (bulkError.writeErrors) {
                    errors.push(...bulkError.writeErrors.map(err => ({
                        index: err.index,
                        code: err.code,
                        message: err.errmsg
                    })));
                }

                results.push({
                    matched: bulkError.result?.nMatched || 0,
                    modified: bulkError.result?.nModified || 0,
                    upserted: bulkError.result?.nUpserted || 0,
                    errors: bulkError.writeErrors?.length || 0
                });
            }
        }

        // Get a sample of accounts to return
        const sampleAccounts = await ChartOfAccount.find().limit(10);

        res.json({
            success: true,
            message: `Processed ${operations.length} accounts`,
            accountsReceived: accounts.length,
            validAccountsFound: operations.length,
            results,
            errors: errors.length > 0 ? errors : undefined,
            sample: sampleAccounts
        });
    } catch (error) {
        console.error('Error syncing chart of accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync chart of accounts',
            error: error.message
        });
    }
};

module.exports = {
    syncChartOfAccounts,
};