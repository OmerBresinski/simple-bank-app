import React from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

interface TruelayerLinkProps {
  onSuccess: (accessToken: string, refreshToken: string) => void;
}

const TruelayerLink: React.FC<TruelayerLinkProps> = ({ onSuccess }) => {
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      // Generate a random state parameter
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("truelayer_state", state);

      // Generate a random nonce
      const nonce = Math.random().toString(36).substring(7);
      localStorage.setItem("truelayer_nonce", nonce);

      // Get the auth URL from the backend
      const response = await fetch(`${API_URL}/api/truelayer/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state, nonce }),
      });

      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }

      const { authUrl } = await response.json();

      // Open the Truelayer authorization URL in a popup
      const width = 600;
      const height = 800;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        "Truelayer Auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === "TRUELAYER_AUTH_SUCCESS") {
          onSuccess(event.data.accessToken, event.data.refreshToken);
          popup.close();
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("Error connecting to Truelayer:", error);
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Connect to Truelayer
    </button>
  );
};

export default TruelayerLink;
