import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlaidLink } from "./components/PlaidLink";
import { SpendingMetrics } from "./components/SpendingMetrics";
import { createLinkToken } from "./api/client";
import "./App.css";

const queryClient = new QueryClient();

// Constants for localStorage keys
const PLAID_ACCESS_TOKEN_KEY = "plaid_access_token";

function App() {
  const [linkToken, setLinkToken] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  // Load access token from localStorage on component mount
  useEffect(() => {
    const savedAccessToken = localStorage.getItem(PLAID_ACCESS_TOKEN_KEY);
    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
    }
  }, []);

  const handleGetLinkToken = async () => {
    try {
      const response = await createLinkToken();
      setLinkToken(response.link_token);
    } catch (error) {
      console.error("Error getting link token:", error);
    }
  };

  const handleSuccess = (newAccessToken: string) => {
    // Save access token to localStorage
    localStorage.setItem(PLAID_ACCESS_TOKEN_KEY, newAccessToken);
    setAccessToken(newAccessToken);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {!accessToken ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold mb-8">Simple Bank</h1>
              <button
                onClick={handleGetLinkToken}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Get Link Token
              </button>

              {linkToken && (
                <PlaidLink linkToken={linkToken} onSuccess={handleSuccess} />
              )}
            </div>
          ) : (
            <SpendingMetrics accessToken={accessToken} />
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
