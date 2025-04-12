const OAuthClient = require("intuit-oauth");
const { oauthClient } = require("../config/oauthClient");
const Token = require("../models/Token");
const { getLatestToken } = require("../utils/helper");

//Initiate auth flow
const initiateAuth = (req, res) => {
    const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: "testState"
    });
    console.log(authUri, 'authUri');
    res.redirect(authUri);
}

const handleCallback = async (req, res) => {
    try {
        const authResponse = await oauthClient.createToken(req.url);
        const authToken = authResponse.getToken();
        const realmId = req.query.realmId;

        // Calculate expires_at if it's not present
        if (!authToken.expires_at && authToken.expires_in) {
            // Convert expires_in (seconds) to milliseconds and add to current time
            authToken.expires_at = new Date(Date.now() + (authToken.expires_in * 1000)).toISOString();
        }

        console.log("Token created:", {
            access_token: authToken.access_token ? "present" : "missing",
            refresh_token: authToken.refresh_token ? "present" : "missing",
            expires_in: authToken.expires_in,
            expires_at: authToken.expires_at
        });

        // Store token in database
        await Token.create({
            token: authToken,
            realmId: realmId
        });

        console.log("Authentication successful");
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error) {
        console.error("OAuth callback error:", error);
        res.status(500).send(`Authentication failed: ${error.message}`);
    }
}

const getApiStatus = async (req, res) => {
    try {
        const { token, realmId } = await getLatestToken();

        res.json({
            status: "Connected",
            realmId: realmId,
            tokenExpires: new Date(token.expires_at).toISOString(),
            availableEndpoints: [
                "/sync/chart-of-accounts",
                "/sync/payees",
                "/sync/transactions",
                "/sync/all"
            ]
        });
    } catch (error) {
        if (error.name === 'UnauthorizedError') {
            res.json({
                status: "Not connected",
                message: "Please authenticate with QuickBooks first",
                authUrl: "/auth"
            });
        } else {
            throw error;
        }
    }
}

const getTokenStatus = async (req, res) => {
    try {
        const { token, realmId } = await getLatestToken();
        const expiresAt = new Date(token.expires_at);
        const now = new Date();
        const expiresInMinutes = Math.round((expiresAt - now) / 60000);

        res.json({
            status: "active",
            realmId,
            expiresAt: expiresAt.toISOString(),
            expiresInMinutes,
            needsRefresh: expiresInMinutes < 10
        });
    } catch (error) {
        res.json({
            status: "inactive",
            message: "No valid token found",
            authUrl: "/auth"
        });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { token, realmId } = await getLatestToken();
        console.log(token, realmId, 'token realmId');
        oauthClient.setToken(token);

        const authResponse = await oauthClient.refreshUsingToken(token.refresh_token);
        const newToken = authResponse.getToken();

        console.log(newToken, 'newToken');

        // Save new token to database
        await Token.create({
            token: newToken,
            realmId: realmId
        });

        res.json({
            success: true,
            message: "Token refreshed successfully",
            expiresAt: new Date(newToken.expires_at).toISOString()
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({
            success: false,
            message: "Failed to refresh token",
            error: error.message,
            authUrl: "/auth"
        });
    }
}

const logout = async (req, res) => {
    try {
        const { realmId } = req.body;
        
        if (!realmId) {
            return res.status(400).json({ success: false, message: "realmId is required" });
        }

        const deleted = await Token.deleteMany({ realmId });

        if (deleted.deletedCount > 0) {
            res.json({
                success: true,
                message: "Logged out successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No active session found"
            });
        }
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to log out"
        });
    }
};

module.exports = {
    initiateAuth,
    handleCallback,
    getApiStatus,
    getTokenStatus,
    refreshToken,
    logout
};

