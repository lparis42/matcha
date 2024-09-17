import React from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"
import { Nav } from "@/components/nav";

export function Component() {

  const { user } = useSocket();
  const { toast } = useToast();

  if (!user) { //DEVELOPEMENT: change to !user
    Navigate({ to: "/signin" });
    toast({title: "You must be logged in to access this page"});
  }
  else {
    return (
      <>
          <Nav />
          <Outlet />
      </>
    )
  }
}
