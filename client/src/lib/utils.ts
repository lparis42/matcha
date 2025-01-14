import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateLastConnection = (lastConnectionDate) => {
  if (!lastConnectionDate) {
    return "Never connected";
  }
  const lastConnection = new Date(lastConnectionDate);
  return `last connection ${lastConnection.toLocaleDateString()} ${lastConnection.toLocaleTimeString()}`;
};
