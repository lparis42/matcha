if (process.env.NODE_ENV !== 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
}
// index.tsx or index.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router'; // Update path if necessary
import { SocketProvider } from './api/Socket';
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from './components/error-boundaries';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SocketProvider>
  </ErrorBoundary>
);
