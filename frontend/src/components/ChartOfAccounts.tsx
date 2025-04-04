import React, { useState, useEffect } from 'react';
import { FaSync, FaSearch, FaFilter } from 'react-icons/fa';
import { fetchAccounts, syncAccounts } from '../services/api';
import { Account } from '@/types';

const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    const data = await fetchAccounts();
    setAccounts(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const success = await syncAccounts();
    if (success) loadAccounts();
    setSyncing(false);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      account.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.AccountNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    return filter === 'all' ? matchesSearch : matchesSearch && account.AccountType === filter;
  });

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Chart of Accounts</h1>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={handleSync} disabled={syncing}
        >
          <FaSync className={syncing ? 'animate-spin mr-2' : 'mr-2'} />
          {syncing ? "Syncing..." : "Sync Accounts"}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center border rounded-lg p-2 bg-gray-50 shadow-sm">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search accounts..."
            className="outline-none bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center border rounded-lg p-2 bg-gray-50 shadow-sm">
          <FaFilter className="text-gray-500 mr-2" />
          <select className="outline-none bg-transparent" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Account Types</option>
            {[...new Set(accounts.map(account => account.AccountType))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading accounts...</div>
      ) : filteredAccounts.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200 shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Account Number</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Subtype</th>
              <th className="p-3 border">Balance</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(account => (
              <tr key={account.Id} className="odd:bg-gray-50 even:bg-white">
                <td className="p-3 border">{account.AccountNumber || '-'}</td>
                <td className="p-3 border">{account.Name}</td>
                <td className="p-3 border">{account.AccountType}</td>
                <td className="p-3 border">{account.AccountSubType || '-'}</td>
                <td className="p-3 border">{account.CurrentBalance?.toFixed(2) || '0.00'}</td>
                <td className="p-3 border">
                  <span className={`px-2 py-1 text-sm rounded-lg ${account.Active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {account.Active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500">No accounts found.</div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
