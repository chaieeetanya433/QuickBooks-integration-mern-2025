# QuickBooks Integration Backend

This backend service provides a bridge between your application and QuickBooks Online, allowing you to authenticate with the QuickBooks API and synchronize financial data including chart of accounts, payees, and transactions.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Database](#database)
- [Error Handling](#error-handling)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Features

- OAuth 2.0 authentication with QuickBooks Online
- Token management (storage, refresh, validation)
- Synchronization of financial data:
  - Chart of Accounts
  - Payees (vendors and customers)
  - Transactions
- Error handling middleware
- CORS support for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- QuickBooks Developer account with an app created
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quickbooks-integration-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Configuration](#configuration) section)

4. Start the server:
   ```bash
   npm start
   ```

For development with auto-restart:
```bash
npm run dev
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=<your-mongodb-connection-string>
CLIENT_ID=<your-quickbooks-client-id>
CLIENT_SECRET=<your-quickbooks-client-secret>
REDIRECT_URI=http://localhost:3000/auth/callback
ENVIRONMENT=sandbox  # or production
PORT=3000
CLIENT_URL=<your-frontend-url>  # e.g., http://localhost:5173
```

### QuickBooks App Configuration

1. Create an app in the [QuickBooks Developer Portal](https://developer.intuit.com/)
2. Configure your app with the following:
   - **Redirect URI**: Must match exactly what you've set in your .env file
   - **Scopes**: Make sure to enable `com.intuit.quickbooks.accounting` and `openid`

## API Endpoints

### Authentication

- `GET /auth` - Initiates the OAuth flow with QuickBooks
- `GET /auth/callback` - Handles the OAuth callback from QuickBooks
- `GET /auth/api-status` - Gets the current API connection status
- `GET /auth/token-status` - Gets the current token status (active/inactive)
- `POST /auth/refresh-token` - Manually refreshes the OAuth token
- `POST /auth/logout` - Logs out and removes stored tokens

### Data Synchronization

- `GET /sync/chart-of-accounts` - Synchronizes chart of accounts from QuickBooks
- `GET /sync/payees` - Synchronizes vendors and customers from QuickBooks
- `GET /sync/transactions` - Synchronizes transactions from QuickBooks
- `GET /sync/all` - Synchronizes all data types in sequence

## Authentication Flow

1. User initiates authentication by visiting `/auth`
2. User is redirected to QuickBooks login/authorization page
3. After authorization, QuickBooks redirects to `/auth/callback` with authorization code
4. Backend exchanges the code for access and refresh tokens
5. Tokens are stored in the database for future API calls
6. Access token is automatically refreshed when expired

## Database

This application uses MongoDB to store:

1. OAuth tokens (access token, refresh token, expiry information)
2. QuickBooks realm ID
3. Synchronized data:
   - Chart of accounts
   - Payees (vendors and customers)
   - Transactions

## Error Handling

The application includes a global error handler middleware that:

- Formats error responses consistently
- Logs errors for debugging
- Handles different types of errors (validation errors, authentication errors, etc.)

## Development

### Project Structure

```
├── config/              # Configuration files
│   ├── db.js            # Database connection
│   └── oauthClient.js   # QuickBooks OAuth client setup
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
│   └── errorHandler.js  # Global error handler
├── models/              # MongoDB models
├── routes/              # Route definitions
├── utils/               # Utility functions
├── .env                 # Environment variables (create from .env.example)
├── index.js             # Application entry point
└── package.json         # Project metadata and dependencies
```

### Adding New Endpoints

1. Create a new route file in the `routes` directory
2. Create corresponding controller functions in the `controllers` directory
3. Register the routes in `index.js`

## Troubleshooting

### Common Issues

#### OAuth Connection Problems

- Verify your Client ID and Client Secret are correct
- Ensure your Redirect URI in the QuickBooks Developer portal matches exactly what's in your .env file
- Check that your app has the necessary scopes enabled
- Confirm you're using the correct environment (sandbox/production)

#### Token Refresh Failures

- Check that your refresh token hasn't expired (they usually last 100 days)
- Verify your network connectivity to QuickBooks API
- Ensure your app hasn't been disabled in the QuickBooks Developer portal

#### Database Connection Issues

- Check your MongoDB connection string
- Verify network connectivity to your MongoDB instance
- Ensure your IP address is whitelisted if using MongoDB Atlas

---

## License

[MIT License](LICENSE)

