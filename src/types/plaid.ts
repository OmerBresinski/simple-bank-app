export interface Transaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total_transactions: number;
}

export interface PlaidError {
  error_code: string;
  error_message: string;
  error_type: string;
  display_message: string | null;
  documentation_url: string;
  request_id: string;
  suggested_action: string | null;
}
