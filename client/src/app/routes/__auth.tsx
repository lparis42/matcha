import React, { useEffect, useState } from "react";
import { useSocket } from "@/api/Socket";
import { Navigate, Outlet, useLocation, useRouteError } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"
import { Nav } from "@/components/nav";
import { useAccount } from "@/hook/useAccount";
import { useAuth, AuthStatus } from "@/hook/useAuth";

export function ErrorBoundary() {
  useRouteError()
  return <Navigate to="/signin" />
}

export function Component() {
  const { account } = useAccount();
  const location = useLocation();

  const isNoPictures = (location.pathname !== "/profile" && (!account.pictures || account.pictures.length === 0 || account.pictures[0] === ""));
  return (
      <>
          <Nav />
          {isNoPictures ? <Navigate to="/profile" /> : <Outlet />}
      </>
    )
}
