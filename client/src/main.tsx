// index.tsx or index.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router'; // Update path if necessary

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);