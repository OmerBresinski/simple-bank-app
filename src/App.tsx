import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TruelayerLink from "./components/TruelayerLink";
import TruelayerCallback from "./components/TruelayerCallback";
import Transactions from "./components/Transactions";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [truelayerAccessToken, setTruelayerAccessToken] = useState<
    string | null
  >(null);
  const [truelayerRefreshToken, setTruelayerRefreshToken] = useState<
    string | null
  >(null);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("truelayer_access_token");
    const storedRefreshToken = localStorage.getItem("truelayer_refresh_token");
    if (storedAccessToken && storedRefreshToken) {
      setTruelayerAccessToken(storedAccessToken);
      setTruelayerRefreshToken(storedRefreshToken);
    }
  }, []);

  const handleTruelayerSuccess = (
    accessToken: string,
    refreshToken: string
  ) => {
    setTruelayerAccessToken(accessToken);
    setTruelayerRefreshToken(refreshToken);
    localStorage.setItem("truelayer_access_token", accessToken);
    localStorage.setItem("truelayer_refresh_token", refreshToken);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/callback"
            element={
              <TruelayerCallback
                onSuccess={(accessToken, refreshToken) => {
                  handleTruelayerSuccess(accessToken, refreshToken);
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
                    <TruelayerLink onSuccess={handleTruelayerSuccess} />
                  </div>
                )}

                {truelayerAccessToken && truelayerRefreshToken && (
                  <div className="h-full">
                    <Transactions
                      accessToken={truelayerAccessToken}
                      refreshToken={truelayerRefreshToken}
                      onTokenUpdate={handleTruelayerSuccess}
                    />
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
