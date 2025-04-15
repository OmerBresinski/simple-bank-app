import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/client";

interface SpendingMetricsProps {
  accessToken: string;
}

interface Transaction {
  date: string;
  amount: number;
  transaction_type: string;
  payment_channel: string;
}

export const SpendingMetrics = ({ accessToken }: SpendingMetricsProps) => {
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", accessToken],
    queryFn: () => getTransactions(accessToken),
  });

  // Add debug logging
  console.log("Transactions data:", transactions);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);

  if (isLoading)
    return <div className="text-4xl font-bold text-gray-700">Loading...</div>;
  if (error)
    return (
      <div className="text-4xl font-bold text-red-500">
        Error loading transactions
      </div>
    );
  if (!transactions || transactions.length === 0)
    return (
      <div className="text-4xl font-bold text-gray-700">
        No transactions found
      </div>
    );

  // Calculate spending metrics
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailySpending = transactions
    .filter((t: Transaction) => new Date(t.date) >= oneDayAgo && t.amount > 0)
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const weeklySpending = transactions
    .filter((t: Transaction) => new Date(t.date) >= oneWeekAgo && t.amount > 0)
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const monthlySpending = transactions
    .filter((t: Transaction) => new Date(t.date) >= oneMonthAgo && t.amount > 0)
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  // Format numbers as currency with commas and up to 2 decimal places
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-blue-500 p-4">
      <div className="text-white text-2xl">
        {formatCurrency(dailySpending)}d
      </div>
      <div className="text-white text-2xl">
        {formatCurrency(weeklySpending)}w
      </div>
      <div className="text-white text-2xl">
        {formatCurrency(monthlySpending)}m
      </div>
    </div>
  );
};
