import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LoginPage from './LoginPage';
import ChartOfAccounts from './ChartOfAccounts';
import Payees from './Payees';
import Transactions from './Transactions';
import Navbar from './Navbar';
import TokenStatus from './TokenStatus';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

// Set axios defaults
axios.defaults.baseURL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

const QuickbooksIntegration: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [connectionStatus, setConnectionStatus] = useState<Record<string, any>>({});

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check if user is authenticated with QuickBooks
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/auth/api-status');
      if (response.data.status === 'Connected') {
        setIsAuthenticated(true);
        setConnectionStatus(response.data);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      toast.error('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth redirect on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const realmId = urlParams.get('realmId');
    
    if (code && realmId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.info('Processing authentication...');
      checkAuthStatus();
    }
  }, []);

  // Authentication guard for routes
  const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isLoading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading application...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Toaster position="top-right" richColors />
        {isAuthenticated && <Navbar connectionStatus={connectionStatus}/>}
        
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard connectionStatus={connectionStatus} refreshStatus={checkAuthStatus} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chart-of-accounts" 
              element={
                <PrivateRoute>
                  <ChartOfAccounts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/payees" 
              element={
                <PrivateRoute>
                  <Payees />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/token-status" 
              element={
                <PrivateRoute>
                  <TokenStatus refreshStatus={checkAuthStatus} />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default QuickbooksIntegration;
