import { usePlaidLink } from "react-plaid-link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exchangePublicToken } from "../api/client";

interface PlaidLinkProps {
  linkToken: string;
  onSuccess: (accessToken: string) => void;
}

export const PlaidLink = ({ linkToken, onSuccess }: PlaidLinkProps) => {
  const queryClient = useQueryClient();

  const { mutate: exchangeToken } = useMutation({
    mutationFn: exchangePublicToken,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data.access_token);
    },
  });

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => {
      exchangeToken(publicToken);
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      Connect Bank Account
    </button>
  );
};
