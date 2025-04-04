const OAuthClient = require("intuit-oauth");

// OAuth Client Setup
const oauthClient = new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: process.env.ENVIRONMENT, // 'sandbox' or 'production'
    redirectUri: process.env.REDIRECT_URI
});

// Get base URL for API calls based on environment
const getApiBase = () => {
    return oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';
};

module.exports = { oauthClient, getApiBase };