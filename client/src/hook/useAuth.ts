import { useAccountStore } from "../store.ts";
import { useCallback } from "react";

export enum AuthStatus {
    Unknown,
    Authenticated,
    Guest,
  }

export function useAuth() {
  const { account, setAccount } = useAccountStore();
  let status;
  switch (account) {
    case null:
      status = AuthStatus.Guest;
      break;
    case undefined:
      status = AuthStatus.Unknown;
      break;
    default:
      status = AuthStatus.Authenticated;
      break;
  }

  const authenticate = useCallback(() => {
    
  }, []);

  const login = useCallback((username: string, password: string) => {
    
  }, []);

  const logout = useCallback(() => {
    
  }, []);

  return {
    account,
    status,
    authenticate,
    login,
    logout,
  };
}
