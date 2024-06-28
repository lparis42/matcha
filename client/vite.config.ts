import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import RemixRouter from 'vite-plugin-remix-router'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), RemixRouter({ routesDirectory: 'src/app/routes' })],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // For development purposes
  server: {
    https: {
      key: fs.readFileSync('../server/server.key'),
      cert: fs.readFileSync('../server/server.crt'),
      passphrase: 'KEY'
    },
    host: true,
  },
})
