import { useAuth } from "./useAuth.ts";

export function useAccount() {
  const { account } = useAuth();

  if (!account) {
    throw new Error("User is not authenticated");
  }

  return {
    account,
  };
}
