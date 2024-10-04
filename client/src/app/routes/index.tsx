// src/routes/hello.tsx

import React, { useEffect } from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hook/useAuth";

const DEBUG = false

export function Component() {
  const { status } = useAuth();
  if (DEBUG)
    return (
      <App />
    )

  if (status === "Authenticated")
    Navigate({to: "/browse"})
  else
    Navigate({to: "/signin"})
}
