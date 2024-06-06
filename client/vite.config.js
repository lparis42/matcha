import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import RemixRouter from 'vite-plugin-remix-router'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
            RemixRouter({routesDirectory: "src/app/routes"})
  ],
  // For development purposes
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://localhost:443',
        changeOrigin: true,
        ws: true,
        secure: false, // To accept self-signed certificate
      },
    },
    host: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
