export interface Wallet {
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface AdminWallet extends Wallet {
  companyId: string;
}

export type WalletTransactionDirection = "CREDIT" | "DEBIT";

export type WalletTransactionSortField = "CREATED_AT" | "AMOUNT";

export type KnownWalletTransactionType =
  | "ADMIN_CREDIT"
  | "ADMIN_DEBIT"
  | "SUBSCRIPTION_NEW"
  | "SUBSCRIPTION_RENEWAL"
  | "TOP_UP"
  | "REFUND";

export type WalletTransactionType = KnownWalletTransactionType | (string & {});

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export interface AdminWalletTransaction extends WalletTransaction {
  createdBy?: string;
}

export interface WalletTransactionsListParams {
  page?: number;
  size?: number;
  sort?: WalletTransactionSortField;
  direction?: "ASC" | "DESC";
  type?: WalletTransactionType;
}

export interface WalletAdjustmentRequest {
  requestId: string;
  direction: WalletTransactionDirection;
  amount: number;
  note: string;
}
