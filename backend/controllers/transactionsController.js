const Transaction = require("../models/Transaction");
const { setupOAuthClient } = require("../utils/helper");

const syncTransactions = async (req, res) => {
    const { oauthClient, realmId } = await setupOAuthClient();

    // Fetch Purchases
    const purchasesResponse = await oauthClient.makeApiCall({
        url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/query`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/text',
            'Accept': 'application/json'
        },
        body: 'SELECT * FROM Purchase'
    });

    const purchases = purchasesResponse.json.QueryResponse.Purchase?.map(purchase => ({
        Id: purchase.Id,
        type: "purchase",
        TotalAmt: purchase.TotalAmt,
        TxnDate: { $date: purchase.TxnDate }
    })) || [];

    // Fetch Deposits
    const depositsResponse = await oauthClient.makeApiCall({
        url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/query`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/text',
            'Accept': 'application/json'
        },
        body: 'SELECT * FROM Deposit'
    });

    const deposits = depositsResponse.json.QueryResponse.Deposit?.map(deposit => ({
        Id: deposit.Id,
        type: "deposit",
        TotalAmt: deposit.TotalAmt,
        TxnDate: { $date: deposit.TxnDate }
    })) || [];

    const transactions = [...purchases, ...deposits];

    // Prepare Bulk Operations
    const bulkOps = transactions.map(txn => ({
        updateOne: {
            filter: { Id: txn.Id },
            update: { $set: txn },
            upsert: true
        }
    }));

    // Execute Bulk Write
    if (bulkOps.length > 0) {
        await Transaction.bulkWrite(bulkOps, { ordered: false });
    }

    res.json({
        success: true,
        purchases,
        deposits
    });
}

module.exports = {
    syncTransactions
}