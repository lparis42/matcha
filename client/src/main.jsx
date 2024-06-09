import React from 'react'
import { createRoot } from 'react-dom/client'
//import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import App from './app/App.jsx'
import './index.css'
import {router} from '@/router'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
