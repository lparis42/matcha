import { useAuth } from "./useAuth.ts";
import { useNavigate } from "react-router-dom";

export function useAccount() {
  const { account } = useAuth();
  const navigate = useNavigate();

  if (!account) {
    navigate("/signin");
    return ;
  }

  return {
    account,
  };
}
