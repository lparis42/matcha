import React from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"

export function Component() {

  const { log } = useSocket();
  const { toast } = useToast();

  if (log) { //!log
    Navigate({ to: "/signin" });
    toast({title: "You must be logged in to access this page"});
  }
  else {
    return (
        <Outlet />
    )
  }
}
