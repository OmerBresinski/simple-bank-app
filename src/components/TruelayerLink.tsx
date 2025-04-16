import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Remove trailing slash if present

interface TruelayerLinkProps {
  onSuccess: (token: string) => void;
}

const TruelayerLink: React.FC<TruelayerLinkProps> = ({ onSuccess }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "TRUELAYER_AUTH_SUCCESS") {
        onSuccess(event.data.token);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${API_URL}/api/truelayer/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get Truelayer auth URL");
      }

      const data = await response.json();

      if (data.authUrl) {
        // Store the state and nonce from the server response
        localStorage.setItem("truelayer_state", data.state);
        localStorage.setItem("truelayer_nonce", data.nonce);

        // Open Truelayer auth in a popup window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
          data.authUrl,
          "Truelayer Auth",
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } else {
        throw new Error("No auth URL received from server");
      }
    } catch (error) {
      console.error("Error connecting to Truelayer:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isConnecting ? "Connecting..." : "Connect with Truelayer"}
      </button>
    </div>
  );
};

export default TruelayerLink;
