const { setupOAuthClient } = require("../utils/helper");

exports.getAccountDetailsFromQBO = async (accountId) => {
    const { oauthClient, realmId } = await setupOAuthClient();

    const accessToken = oauthClient.getToken().access_token;

    const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Account WHERE Id = '${accountId}'`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch account details. Status: ${response.status}, Body: ${errorBody}`);
    }

    const data = await response.json();
    return data?.QueryResponse?.Account?.[0] || null;
};
