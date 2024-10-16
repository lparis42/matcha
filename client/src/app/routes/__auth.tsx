import React from "react";
import { useSocket } from "@/api/Socket";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"
import { Nav } from "@/components/nav";
import { useAccount } from "@/hook/useAccount";
import { useAuth, AuthStatus } from "@/hook/useAuth";

export function Component() {
  const { status, account } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  if (status !== AuthStatus.Authenticated) {
    Navigate({ to: "/signin" });
    toast({title: "You must be logged in to access this page"});
    return null;
  }
  const isNoPictures = (location.pathname !== "/profile" && (!account.pictures || account.pictures.length === 0))
  return (
      <>
          <Nav />
          {isNoPictures ? <Navigate to="/profile" /> : <Outlet />}
      </>
    )
}
