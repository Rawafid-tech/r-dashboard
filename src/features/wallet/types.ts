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

// ─── Payments / Top-Up ───────────────────────────────────────────────────────

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "NEEDS_REVIEW";

export type PaymentGateway = "PAYMOB" | (string & {});

export type PaymentPurpose = "WALLET_TOP_UP" | (string & {});

export type PaymentSortField = "CREATED_AT" | "AMOUNT";

export interface Payment {
  id: string;
  gateway: PaymentGateway;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  /** Whether the money has been credited to the wallet. */
  credited: boolean;
  amount: number;
  currency: string;
  /** null until the gateway confirms the method used */
  paymentMethod: string | null;
  /** e.g. "MasterCard", "Visa" — treat as a label, not an enum */
  paymentMethodDetail: string | null;
  failureReason: string | null;
  /** Present only while status === "PENDING"; null on finished payments */
  checkoutUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TopUpRequest {
  amount: number;
}

export interface TopUpResponse {
  paymentId: string;
  amount: number;
  currency: string;
  checkoutUrl: string;
}

/**
 * The 400 "below minimum" error shape from POST /api/payments/topup.
 * `minimum` and `currency` sit at the top level of the problem detail,
 * NOT nested under `errors[]`.
 */
export interface TopUpMinimumError {
  detail: string;
  status: 400;
  title: string;
  currency: string;
  minimum: number;
}

export interface PaymentsListParams {
  page?: number;
  size?: number;
  sort?: PaymentSortField;
  direction?: "ASC" | "DESC";
}
