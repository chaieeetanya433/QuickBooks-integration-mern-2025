import React, { useState } from "react";
import {
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBook,
  FaUsers,
  FaExchangeAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

interface ConnectionStatus {
  status?: string;
  realmId?: string;
  tokenExpires?: string;
}

interface SyncResults {
  success: boolean;
  accounts?: { message: string };
  payees?: string;
  transactions?: string;
  message?: string;
}

interface DashboardProps {
  connectionStatus: ConnectionStatus;
  refreshStatus: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ connectionStatus, refreshStatus }) => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);

  const handleSyncAll = async () => {
    setSyncInProgress(true);
    setSyncResults(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await axios.get<{ success: boolean; accounts: any; payees: any; transactions: any; error?: any }>("/sync/all");

      if (response.data.success) {
        setSyncResults({
          success: true,
          accounts: response.data.accounts,
          payees: response.data.payees,
          transactions: response.data.transactions,
        });
        toast.success("Data synchronized successfully!");
      } else {
        setSyncResults({
          success: false,
          message: response.data.error || "Unknown error occurred",
        });
        toast.error("Sync failed!");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Sync error:", error);

      if (error.response && error.response.status === 401) {
        toast.error("Authentication expired. Please reconnect your QuickBooks account.");
        refreshStatus();
      } else {
        toast.error(error.response?.data?.message || "Failed to synchronize data");
        setSyncResults({
          success: false,
          message: error.response?.data?.message || "Network error occurred",
        });
      }
    } finally {
      setSyncInProgress(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">QuickBooks Integration Dashboard</h1>
        <div className="flex items-center space-x-2">
          {connectionStatus.status === "Connected" ? (
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="text-xl" />
              <span className="ml-2">Connected to QuickBooks</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="text-xl" />
              <span className="ml-2">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {connectionStatus.status === "Connected" && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
          <p>
            <strong>Realm ID:</strong> {connectionStatus.realmId}
          </p>
          {connectionStatus.tokenExpires && (
            <p>
              <strong>Token Expires:</strong>{" "}
              {new Date(connectionStatus.tokenExpires).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col space-y-4">
        <button
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
          onClick={handleSyncAll}
          disabled={syncInProgress || connectionStatus.status !== "Connected"}
        >
          <FaSync className={`mr-2 ${syncInProgress ? "animate-spin" : ""}`} />
          {syncInProgress ? "Syncing..." : "Sync All Data"}
        </button>

        <Link
          to="/token-status"
          className="text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Check Token Status
        </Link>
      </div>

      {syncResults && (
        <div className={`mt-6 p-4 rounded-lg ${syncResults.success ? "bg-green-100" : "bg-red-100"}`}>
          <h2 className="text-lg font-semibold mb-2">Sync Results</h2>
          {syncResults.success ? (
            <div className="space-y-2">
              <p><strong>Chart of Accounts:</strong> {syncResults.accounts?.message}</p>
              <p><strong>Payees:</strong> {syncResults.payees}</p>
              <p><strong>Transactions:</strong> {syncResults.transactions}</p>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="text-xl mr-2" />
              <p>{syncResults.message}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
          <FaBook className="text-blue-500 text-3xl" />
          <h2 className="text-lg font-semibold mt-2">Chart of Accounts</h2>
          <p className="text-gray-600 text-sm text-center">
            View and manage your QuickBooks chart of accounts
          </p>
          <Link to="/chart-of-accounts" className="mt-2 text-blue-600 font-bold">View Accounts</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
          <FaUsers className="text-green-500 text-3xl" />
          <h2 className="text-lg font-semibold mt-2">Payees</h2>
          <p className="text-gray-600 text-sm text-center">
            Manage vendors and customers from QuickBooks
          </p>
          <Link to="/payees" className="mt-2 text-green-600 font-bold">View Payees</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
          <FaExchangeAlt className="text-purple-500 text-3xl" />
          <h2 className="text-lg font-semibold mt-2">Transactions</h2>
          <p className="text-gray-600 text-sm text-center">
            View and categorize uncategorized transactions
          </p>
          <Link to="/transactions" className="mt-2 text-purple-600 font-bold">View Transactions</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
