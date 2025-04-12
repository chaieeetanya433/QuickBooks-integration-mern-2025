// utils/webhookHandlers.js
const ChartOfAccount = require("../models/ChartOfAccount");
const Payee = require("../models/Payee");
const Transaction = require("../models/Transaction");
const { setupOAuthClient } = require("./helper.js");

// Helper function to sync a specific account
async function syncAccount(realmId, accountId) {
    try {
        const { oauthClient } = await setupOAuthClient();
        
        const response = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/account/${accountId}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const account = response.json.Account;
        
        if (account) {
            await ChartOfAccount.updateOne(
                { Id: account.Id },
                account,
                { upsert: true }
            );
            console.log(`Account ${account.Id} synced successfully`);
        }
    } catch (error) {
        console.error(`Error syncing account ${accountId}:`, error);
    }
}

// Helper function to sync a specific payee (vendor or customer)
async function syncPayee(realmId, payeeId, payeeType) {
    try {
        const { oauthClient } = await setupOAuthClient();
        
        const endpoint = payeeType.toLowerCase();
        
        const response = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/${endpoint}/${payeeId}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const payee = response.json[payeeType];
        
        if (payee) {
            await Payee.updateOne(
                { Id: payee.Id, type: payeeType.toLowerCase() },
                {
                    Id: payee.Id,
                    DisplayName: payee.DisplayName || "Unnamed",
                    type: payeeType.toLowerCase()
                },
                { upsert: true }
            );
            console.log(`${payeeType} ${payee.Id} synced successfully`);
        }
    } catch (error) {
        console.error(`Error syncing ${payeeType} ${payeeId}:`, error);
    }
}

// Helper function to sync a specific transaction
async function syncTransaction(realmId, txnId, txnType) {
    try {
        const { oauthClient } = await setupOAuthClient();
        
        const endpoint = txnType.toLowerCase();
        
        const response = await oauthClient.makeApiCall({
            url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/${endpoint}/${txnId}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const transaction = response.json[txnType];
        
        if (transaction) {
            await Transaction.updateOne(
                { Id: transaction.Id, type: txnType.toLowerCase() },
                {
                    Id: transaction.Id,
                    type: txnType.toLowerCase(),
                    TotalAmt: transaction.TotalAmt,
                    TxnDate: { $date: transaction.TxnDate },
                    rawData: transaction
                },
                { upsert: true }
            );
            console.log(`${txnType} ${transaction.Id} synced successfully`);
        }
    } catch (error) {
        console.error(`Error syncing ${txnType} ${txnId}:`, error);
    }
}

module.exports = {
    syncAccount,
    syncPayee,
    syncTransaction
};