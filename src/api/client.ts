import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createLinkToken = async () => {
  const response = await apiClient.post("/create_link_token");
  return response.data;
};

export const exchangePublicToken = async (publicToken: string) => {
  const response = await apiClient.post("/exchange_public_token", {
    public_token: publicToken,
  });
  return response.data;
};

export const getTransactions = async (accessToken: string) => {
  const response = await apiClient.get("/transactions", {
    params: { access_token: accessToken },
  });
  return response.data;
};
