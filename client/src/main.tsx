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

//console.error = () => {};
//console.warn = () => {};

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <Suspense fallback={<div>Loading...</div>}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SocketProvider>
    </Suspense>
  </ErrorBoundary>
);
