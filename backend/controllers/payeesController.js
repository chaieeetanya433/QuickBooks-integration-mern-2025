const Payee = require("../models/Payee");
const { setupOAuthClient } = require("../utils/helper");


const syncPayees = async (req, res) => {
    const { oauthClient, realmId } = await setupOAuthClient();

    // Fetch Vendors
    const vendorsResponse = await oauthClient.makeApiCall({
        url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/query`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/text',
            'Accept': 'application/json'
        },
        body: 'SELECT * FROM Vendor'
    });

    const vendors = vendorsResponse.json.QueryResponse.Vendor?.map(vendor => ({
        Id: vendor.Id,
        DisplayName: vendor.DisplayName || "Unnamed",
        type: "vendor"
    })) || [];

    // Fetch Customers
    const customersResponse = await oauthClient.makeApiCall({
        url: `${oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/query`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/text',
            'Accept': 'application/json'
        },
        body: 'SELECT * FROM Customer'
    });

    const customers = customersResponse.json.QueryResponse.Customer?.map(customer => ({
        Id: customer.Id,
        DisplayName: customer.DisplayName || "Unnamed",
        type: "customer"
    })) || [];

    const payees = [...vendors, ...customers];
    const bulkOps = payees.map(payee => ({
        updateOne: {
            filter: { Id: payee.Id },
            update: { $set: payee },
            upsert: true
        }
    }));

    if (bulkOps.length > 0) {
        await Payee.bulkWrite(bulkOps, { ordered: false });
    }

    res.json({
        success: true,
        vendors,
        customers
    });
}

module.exports = {
    syncPayees
}