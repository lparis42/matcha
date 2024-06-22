import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import RemixRouter from 'vite-plugin-remix-router'

export default defineConfig({
  plugins: [react(), RemixRouter({ routesDirectory: 'src/app/routes' })],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
     proxy: {
       '/socket.io': {
         target: 'https://localhost:443',
         changeOrigin: true,
         ws: true,
         secure: false,
         withCredentials: true
       },
    },
    host: true,
  }
})
