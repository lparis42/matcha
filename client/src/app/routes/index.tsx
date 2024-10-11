// src/routes/hello.tsx

import React, { useEffect } from "react";
import { useSocket } from "@/api/Socket";
import { Navigate } from "react-router-dom";
import { AuthStatus, useAuth } from "@/hook/useAuth";

export function Component() {
  const { status } = useAuth();
  if (status === AuthStatus.Authenticated)
    Navigate({to: "/browse"})
  else
    Navigate({to: "/signin"})
}
