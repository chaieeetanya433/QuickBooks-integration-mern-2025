import React, { useState, useEffect } from 'react';
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaKey } from 'react-icons/fa';
import { toast } from 'sonner';
import { fetchTokenStatus, refreshToken } from '../services/api';
import { TokenData } from '@/types';

interface TokenStatusProps {
  refreshStatus: () => void;
}

const TokenStatus: React.FC<TokenStatusProps> = ({ refreshStatus }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTokenStatus();
  }, []);

  const loadTokenStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchTokenStatus();
      setTokenData(data);
    } catch (error) {
      console.error('Error fetching token status:', error);
      toast.error('Failed to fetch token status');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        toast.success('Token refreshed successfully');
        loadTokenStatus();
        refreshStatus();
      } else {
        toast.error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || 'Failed to refresh token');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading token status...</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <FaKey className="text-blue-500 text-xl" />
        <h1 className="text-lg font-semibold">QuickBooks Authentication Status</h1>
      </div>

      {tokenData?.status === 'active' ? (
        <div>
          <div className="flex items-center space-x-2 text-green-600">
            <FaCheckCircle />
            <span>Active</span>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <p><strong>Realm ID:</strong> {tokenData.realmId}</p>
            <p><strong>Expires:</strong> {new Date(tokenData.expiresAt).toLocaleString()}</p>
            <p><strong>Time Remaining:</strong> {tokenData.expiresInMinutes} minutes</p>

            {tokenData.needsRefresh && (
              <div className="flex items-center space-x-2 text-yellow-600 mt-2">
                <FaExclamationTriangle />
                <span>Token will expire soon and should be refreshed</span>
              </div>
            )}
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
            onClick={handleRefreshToken}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Token"}</span>
          </button>
        </div>
      ) : (
        <div className="text-red-600">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle />
            <span>Inactive</span>
          </div>
          <p className="mt-2">{tokenData?.message}</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-red-500 text-white rounded-lg">Return to Login</a>
        </div>
      )}
    </div>
  );
};

export default TokenStatus;
