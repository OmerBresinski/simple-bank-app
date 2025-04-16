import React from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

interface TransactionSummaryProps {
  accessToken: string;
  accountId: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  accessToken,
  accountId,
}) => {
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["truelayerTransactions", accessToken, accountId],
    queryFn: async () => {
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
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <Spinner />
      </div>
    );
  }

  if (!transactionsData?.results) {
    return <div>No transactions found</div>;
  }

  // Filter out GLOBAL MONEY transactions
  const filteredTransactions = transactionsData.results.filter(
    (t: any) => !t.description?.toUpperCase().includes("GLOBAL MONEY")
  );

  // Get current month's date range
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate start of current month
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);

  // Calculate end of current month
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
  endOfCurrentMonth.setHours(23, 59, 59, 999);

  // Calculate start of current day
  const startOfCurrentDay = new Date(now);
  startOfCurrentDay.setHours(0, 0, 0, 0);

  // Calculate start of current week (Monday)
  const startOfCurrentWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfCurrentWeek.setDate(diff);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  // Filter transactions for different time periods
  const dailyTransactions = filteredTransactions.filter((t: any) => {
    const transactionDate = new Date(t.timestamp);
    return t.amount < 0 && transactionDate >= startOfCurrentDay;
  });

  const weeklyTransactions = filteredTransactions.filter((t: any) => {
    const transactionDate = new Date(t.timestamp);
    return t.amount < 0 && transactionDate >= startOfCurrentWeek;
  });

  const monthlyTransactions = filteredTransactions.filter((t: any) => {
    const transactionDate = new Date(t.timestamp);
    return (
      t.amount < 0 &&
      transactionDate >= startOfCurrentMonth &&
      transactionDate <= endOfCurrentMonth
    );
  });

  // Calculate sums
  const dailySum = dailyTransactions.reduce(
    (sum: number, t: any) => sum + Math.abs(t.amount),
    0
  );

  const weeklySum = weeklyTransactions.reduce(
    (sum: number, t: any) => sum + Math.abs(t.amount),
    0
  );

  const monthlySum = monthlyTransactions.reduce(
    (sum: number, t: any) => sum + Math.abs(t.amount),
    0
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="text-6xl font-bold text-stone-400 mb-8">
        £{dailySum.toFixed(2)}d
      </div>
      <div className="text-6xl font-bold text-stone-400 mb-8">
        £{weeklySum.toFixed(2)}w
      </div>
      <div className="text-6xl font-bold text-stone-400">
        £{monthlySum.toFixed(2)}m
      </div>
    </div>
  );
};

export default TransactionSummary;
