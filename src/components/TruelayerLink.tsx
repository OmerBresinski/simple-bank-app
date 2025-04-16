import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Remove trailing slash if present

const TruelayerLink: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);

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

        // Log the auth URL for debugging
        console.log("Redirecting to Truelayer auth URL:", data.authUrl);

        // Redirect to Truelayer auth page
        window.location.href = data.authUrl;
      } else {
        throw new Error("No auth URL received from server");
      }
    } catch (error) {
      console.error("Error connecting to Truelayer:", error);
      // You might want to show an error message to the user here
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
