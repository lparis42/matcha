// src/routes/hello.tsx

import React from "react";
import App from "@/app/App";

import { socket } from "@/api/Socket";

export function Component() {
  return (
    <App socket={socket} />
  )
}
