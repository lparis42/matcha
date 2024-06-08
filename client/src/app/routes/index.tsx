// src/routes/hello.tsx

import React from "react";
import App from "@/app/App";
import { useSocket } from "@/api/Socket";

export function Component() {
  const { socketConnected} = useSocket();
  console.log(socketConnected)
  return (
    <App />
  )
}
