import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
  }
})
