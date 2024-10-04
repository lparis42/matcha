import { useAccountStore } from "../../src/store";

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

  return {
    account,
    status,
    setAccount
  };
}
