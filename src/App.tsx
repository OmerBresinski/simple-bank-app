import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TruelayerLink from "./components/TruelayerLink";
import TruelayerCallback from "./components/TruelayerCallback";
import Transactions from "./components/Transactions";
import "./App.css";

const queryClient = new QueryClient();

// Constants for localStorage keys
const TRUELAYER_ACCESS_TOKEN_KEY = "truelayerAccessToken";

function App() {
  const [truelayerAccessToken, setTruelayerAccessToken] = useState<
    string | null
  >(localStorage.getItem(TRUELAYER_ACCESS_TOKEN_KEY));

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/callback"
            element={
              <TruelayerCallback
                onSuccess={(token) => {
                  setTruelayerAccessToken(token);
                  localStorage.setItem(TRUELAYER_ACCESS_TOKEN_KEY, token);
                }}
              />
            }
          />
          <Route
            path="/"
            element={
              <>
                {!truelayerAccessToken && (
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold mb-8">Simple Bank</h1>
                    <TruelayerLink />
                  </div>
                )}

                {truelayerAccessToken && (
                  <div className="h-full">
                    <Transactions accessToken={truelayerAccessToken} />
                  </div>
                )}
              </>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
