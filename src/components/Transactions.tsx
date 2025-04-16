import React from "react";
import { useQuery } from "@tanstack/react-query";
import TransactionSummary from "./TransactionSummary";
import { FadeLoader } from "react-spinners";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Remove trailing slash if present

interface TransactionsProps {
  accessToken: string;
}

const Transactions: React.FC<TransactionsProps> = ({ accessToken }) => {
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["truelayerAccounts", accessToken],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/truelayer/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      return response.json();
    },
  });

  const accountId = accountsData?.results?.[0]?.account_id;

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery(
    {
      queryKey: ["truelayerTransactions", accessToken, accountId],
      queryFn: async () => {
        if (!accountId) return null;

        const response = await fetch(`${API_URL}/api/truelayer/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            accountId,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        return response.json();
      },
      enabled: !!accountId,
    }
  );

  if (isLoadingAccounts || isLoadingTransactions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <FadeLoader color="#000000" />
      </div>
    );
  }

  if (!transactionsData?.results) {
    return <div>No transactions found</div>;
  }

  return (
    accountId && (
      <TransactionSummary accessToken={accessToken} accountId={accountId} />
    )
  );
};

export default Transactions;
