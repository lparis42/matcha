// src/routes/hello.tsx

import React, { useEffect } from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";
import { Navigate } from "react-router-dom";
import { AuthStatus, useAuth } from "@/hook/useAuth";

const DEBUG = false

export function Component() {
  const { status } = useAuth();
  if (DEBUG)
    return (
      <App />
    )
  if (status === AuthStatus.Authenticated)
    Navigate({to: "/browse"})
  else
    Navigate({to: "/signin"})
}
