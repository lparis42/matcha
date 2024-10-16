import { useCallback } from "react";
import { useAccountStore } from "../../src/store";
import { useSocket } from "@/api/Socket";

export enum AuthStatus {
    Unknown,
    Authenticated,
    Guest,
  }

export function useAuth() {
  const { account, setAccount } = useAccountStore();
  const { eventView } = useSocket();

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

  const authenticate = useCallback(async () => {
    if (account === null)
      return ;
    const [err, data] = await eventView(account.id)
    if (err)
      setAccount(null)
    else
      setAccount(data)
  }, []);

  return {
    account,
    status,
    setAccount,
    authenticate
  };
}
