const { oauthClient } = require("../config/oauthClient");
const Token = require("../models/Token");

// Helper function to retrieve auth tokens from database
async function getLatestToken() {
    const tokenDoc = await Token.findOne().sort({ createdAt: -1 });
    if (!tokenDoc) {
        const error = new Error('No authentication token found');
        error.name = 'UnauthorizedError';
        throw error;
    }
    return {
        token: tokenDoc.token,
        realmId: tokenDoc.realmId
    };
}

// Helper function to set up OAuth client with token and handle refresh
async function setupOAuthClient() {
    const { token, realmId } = await getLatestToken();
    oauthClient.setToken(token);

    // Check if token is expired or about to expire (within 5 minutes)
    const tokenExpiresIn = new Date(token.expires_at) - new Date();
    if (tokenExpiresIn < 300000) { // less than 5 minutes
        try {
            console.log("Token is about to expire. Refreshing...");
            const authResponse = await oauthClient.refreshUsingToken(token.refresh_token);
            const newToken = authResponse.getToken();

            // Save new token to database
            await Token.create({
                token: newToken,
                realmId: realmId
            });

            // Update the client with new token
            oauthClient.setToken(newToken);
        } catch (error) {
            console.error("Error refreshing token:", error);
            const err = new Error('Failed to refresh authentication token');
            err.name = 'UnauthorizedError';
            throw err;
        }
    }

    return { oauthClient, realmId };
}

module.exports = {
    setupOAuthClient,
    getLatestToken
}