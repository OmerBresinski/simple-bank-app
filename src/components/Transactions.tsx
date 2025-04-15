import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/client";
import { Transaction, TransactionsResponse, PlaidError } from "../types/plaid";

interface TransactionsProps {
  accessToken: string;
}

export const Transactions = ({ accessToken }: TransactionsProps) => {
  const { data, isLoading, error, refetch } = useQuery<
    TransactionsResponse,
    PlaidError
  >({
    queryKey: ["transactions", accessToken],
    queryFn: () => getTransactions(accessToken),
    enabled: !!accessToken,
    retry: (failureCount, error) => {
      // Retry if it's a PRODUCT_NOT_READY error
      if (error?.error_code === "PRODUCT_NOT_READY") {
        return failureCount < 5; // Retry up to 5 times
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading transactions...</div>;
  }

  if (error) {
    console.log("Plaid Error:", error); // Log the error for debugging
    if (error.error_code === "PRODUCT_NOT_READY") {
      return (
        <div className="text-center py-4">
          <p className="text-yellow-600 mb-4">
            {error.error_message ||
              "Transactions are being prepared. This may take a few minutes."}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="text-red-500 py-4">
        <p>Error loading transactions: {error.error_message}</p>
        {error.documentation_url && (
          <a
            href={error.documentation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2 block"
          >
            View Documentation
          </a>
        )}
      </div>
    );
  }

  // Log the response data for debugging
  console.log("Transactions Response:", data);

  if (!data?.transactions?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-4">No transactions found</p>
        <p className="text-sm text-gray-500">This might be because:</p>
        <ul className="text-sm text-gray-500 list-disc list-inside mt-2">
          <li>The test user has no transactions</li>
          <li>The date range doesn't include any transactions</li>
          <li>The bank account is new and has no transaction history</li>
        </ul>
        <button
          onClick={() => refetch()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recent Transactions</h2>
        <span className="text-sm text-gray-500">
          Total: {data.total_transactions}
        </span>
      </div>
      <div className="space-y-2">
        {data.transactions.map((transaction: Transaction) => (
          <div
            key={transaction.transaction_id}
            className="p-4 border rounded-lg shadow-sm"
          >
            <div className="flex justify-between">
              <span className="font-medium">{transaction.name}</span>
              <span
                className={
                  transaction.amount > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
