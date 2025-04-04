// Payee Type
export interface Payee {
    Id: string;
    type: "vendor" | "customer";
    DisplayName?: string;
    CompanyName?: string;
    Active?: boolean;
}

// Transaction Type
export interface Transaction {
    Id: string;
    type: "purchase" | "deposit";
    TxnDate?: string;
    TotalAmt?: number;
    CurrencyRef?: { value: string; name: string };
    PaymentType?: string;
}

export interface Account {
    Id: string;
    Name: string;
    Description?: string;
    AccountNumber?: string;
    AccountType: string;
    AccountSubType?: string;
    CurrentBalance?: number;
    Active: boolean;
}

// Interface for Token Data
export interface TokenData {
    status: string;
    realmId: string;
    expiresAt: string;
    expiresInMinutes: number;
    needsRefresh: boolean;
    message?: string;
}