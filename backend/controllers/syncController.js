
const syncAll = async (req, res) => {
    try {
        // Get the base URL for API calls
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Call each sync endpoint without sending response yet
        const [accountsResponse, payeesResponse, transactionsResponse] = await Promise.all([
            fetch(`${baseUrl}/sync/chart-of-accounts`).then(r => r.json()),
            fetch(`${baseUrl}/sync/payees`).then(r => r.json()),
            fetch(`${baseUrl}/sync/transactions`).then(r => r.json())
        ]);

        let payeesResponseMessage = `Processed ${payeesResponse.vendors.length} vendors and ${payeesResponse.customers.length} customers`
        let transactionsResponseMessage = `Processed ${transactionsResponse.purchases.length} uncategorized purchases and ${transactionsResponse.deposits.length} uncategorized deposits`
        
        res.json({
            success: true,
            accounts: accountsResponse,
            payees: payeesResponseMessage,
            transactions: transactionsResponseMessage
        });
    } catch (error) {
        console.error("Error syncing all data:", error);
        throw new Error("Failed to sync all data");
    }
}

module.exports = {
    syncAll
}