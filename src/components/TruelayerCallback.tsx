import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

interface TruelayerCallbackProps {
  onSuccess: (token: string) => void;
}

const TruelayerCallback: React.FC<TruelayerCallbackProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code and state from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        // Verify state matches what we stored
        const storedState = localStorage.getItem("truelayer_state");
        if (!storedState || state !== storedState) {
          console.warn("State parameter mismatch, redirecting to home");
          navigate("/");
          return;
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Exchange the code for an access token
        const response = await fetch(`${API_URL}/api/truelayer/exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to exchange authorization code"
          );
        }

        const data = await response.json();

        // Call the onSuccess callback with the access token
        onSuccess(data.access_token);

        setStatus("success");

        // Clean up the state and nonce
        localStorage.removeItem("truelayer_state");
        localStorage.removeItem("truelayer_nonce");

        // Redirect to the main page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Error in Truelayer callback:", error);
        setStatus("error");
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    };

    handleCallback();
  }, [navigate, onSuccess]);

  return (
    <div className="flex items-center justify-center min-h-dvh bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {status === "processing" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Connecting to Truelayer
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the connection...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Successfully Connected!
            </h2>
            <p className="text-gray-600">
              Redirecting you back to the dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Connection Failed
            </h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruelayerCallback;
