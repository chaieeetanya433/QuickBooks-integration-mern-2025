# QuickBooks Integration Frontend

This frontend application provides a user interface for connecting to QuickBooks Online and managing synchronized financial data including chart of accounts, payees, and transactions.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Components Overview](#components-overview)
- [Authentication Flow](#authentication-flow)
- [State Management](#state-management)
- [Styling](#styling)
- [Development](#development)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## Features

- OAuth authentication flow with QuickBooks Online
- Dashboard interface to view connection status
- Data visualization for:
  - Chart of Accounts
  - Payees (vendors and customers)
  - Transactions
- Token status monitoring and refresh capabilities
- Responsive design with Tailwind CSS
- Toast notifications for user feedback

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API service running (see companion backend repository)
- QuickBooks Developer account with an app created

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quickbooks-integration-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Configuration](#configuration) section)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
VITE_APP_URL=http://localhost:3000  # URL of your backend API
```

## Components Overview

The application consists of the following main components:

- **QuickbooksIntegration**: Main application component that handles routing and authentication state
- **LoginPage**: Initial screen for users to connect with QuickBooks
- **Dashboard**: Main interface after authentication showing connection status and data sync options
- **Navbar**: Navigation bar for authenticated users
- **ChartOfAccounts**: Component to display and manage chart of accounts data
- **Payees**: Component to display and manage vendor and customer data
- **Transactions**: Component to display and manage transaction data
- **TokenStatus**: Component to monitor OAuth token status and refresh tokens

## Authentication Flow

1. User visits the application and is presented with the LoginPage
2. User clicks "Connect with QuickBooks" button
3. User is redirected to QuickBooks OAuth authorization page
4. After authorization, QuickBooks redirects back to the application with authorization code
5. Frontend detects the authorization code and updates authentication state
6. User is redirected to the Dashboard

The authentication status is checked:
- On application load
- After OAuth redirect
- When explicitly refreshed from components

## State Management

The application uses React's useState and useEffect hooks for state management:

- **isAuthenticated**: Boolean state indicating if the user is connected to QuickBooks
- **isLoading**: Boolean state for loading indicators
- **connectionStatus**: Object containing connection details from the API

## Styling

The application uses:
- Tailwind CSS for utility-based styling
- Custom components designed with a clean, modern interface
- Responsive design that works on mobile and desktop devices

## Development

### Project Structure

```
├── src/
│   ├── components/         # React components
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # TypeScript declarations
├── .env                    # Environment variables
├── index.html              # HTML template
├── package.json            # Project metadata and dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Adding New Components

1. Create a new component file in the `components` directory
2. Import and use the component in relevant parent components
3. Add routing if necessary in the main QuickbooksIntegration component

## API Integration

The application communicates with the backend API using Axios:

```javascript
axios.defaults.baseURL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
```

Key API endpoints used:
- `/auth/api-status` - Check connection status
- `/sync/chart-of-accounts` - Get chart of accounts data
- `/sync/payees` - Get vendors and customers data
- `/sync/transactions` - Get transactions data
- `/auth/refresh-token` - Refresh OAuth token

## Troubleshooting

### Common Issues

#### OAuth Connection Problems

- Ensure the backend server is running and accessible
- Check that your VITE_APP_URL is set correctly
- Verify network connectivity between frontend and backend
- Check browser console for CORS errors

#### Authentication Loop

If you're stuck in an authentication loop:
1. Clear browser cookies and localStorage
2. Ensure backend token storage is functioning correctly
3. Check for proper URL handling after OAuth redirect

#### Data Not Loading

- Verify authentication status in browser console
- Check network requests for API errors
- Ensure backend is properly connected to QuickBooks API

#### Token Expiration Issues

- Monitor token status in the TokenStatus component
- Check that automatic or manual token refresh is working
- Verify backend token storage and refresh mechanisms

---

## License

[MIT License](LICENSE)

## Support