import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useRouteError } from "react-router-dom";
import { Nav } from "@/components/nav";
import { useAccount } from "@/hook/useAccount";

export function ErrorBoundary() {
  useRouteError()
  return <Navigate to="/signin" />
}

export function Component() {
  const { account } = useAccount();
  const location = useLocation();

  useEffect(() => {}, [account]);

  if (account)
  {
    const isNoPictures = (location.pathname !== "/profile" && (!account.pictures || account.pictures.length === 0 || account.pictures[0] === ""));
    return (
        <>
            <Nav />
            {isNoPictures ? <Navigate to="/profile" /> : <Outlet />}
        </>
      )
  }
}
