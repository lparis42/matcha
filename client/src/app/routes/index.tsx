// src/routes/hello.tsx

import React, { useEffect } from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";
import { Navigate } from "react-router-dom";

const DEBUG = false

export function Component() {
  const {user} = useSocket()

  if (DEBUG)
    return (
      <App />
    )

  if (user)
    Navigate({to: "/browse"})
  else
    Navigate({to: "/signin"})
}
