/* eslint-disable @typescript-eslint/no-explicit-any */
import { Account, TokenData } from "@/types";
import axios from "axios"
import { toast } from 'sonner';


export const fetchTransactions = async () => {
    const response = await fetch(`${import.meta.env.VITE_APP_URL}/sync/transactions`);
    const data = await response.json();
    return {
        purchases: data.results?.purchases || data.purchases || [],
        deposits: data.results?.deposits || data.deposits || []
    };
};


export const fetchPayees = async () => {
    const response = await fetch(`${import.meta.env.VITE_APP_URL}/sync/payees`);
    const data = await response.json();
    return {
        vendors: data.results?.vendors || data.vendors || [],
        customers: data.results?.customers || data.customers || []
    };
};

export const fetchAccounts = async (): Promise<Account[]> => {
    try {
        const response = await axios.get('/sync/chart-of-accounts');

        return response.data.sample.map((account: any) => ({
            Id: account.Id,
            Name: account.Name,
            AccountType: account.AccountType,
            AccountSubType: account.AccountSubType,
            CurrentBalance: account.CurrentBalance,
            Active: account.Active,
        }));
    } catch (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to fetch chart of accounts');
        return [];
    }
};

// Sync accounts
export const syncAccounts = async (): Promise<boolean> => {
    try {
        const response = await axios.get<{ success: boolean }>('/sync/chart-of-accounts');
        if (response.data.success) {
            toast.success('Chart of accounts synchronized successfully');
            return true;
        } else {
            toast.error('Failed to synchronize accounts');
            return false;
        }
    } catch (error: any) {
        console.error('Sync error:', error);
        if (error.response?.status === 401) {
            toast.error('Authentication expired. Please reconnect your QuickBooks account.');
            setTimeout(() => (window.location.href = '/'), 3000);
        } else {
            toast.error(error.response?.data?.message || 'Failed to synchronize accounts');
        }
        return false;
    }
};

// Fetch token status
export const fetchTokenStatus = async (): Promise<TokenData> => {
    const response = await axios.get<TokenData>('/auth/token/status');
    return response.data;
};

export const refreshToken = async (): Promise<boolean> => {
    const response = await axios.post('/auth/token/refresh');
    return response.data.success;
};