import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev the React app runs under vite (default :5173). The Node API server
// hosts /api/* and /auth/* on :3000 (see server/index.cjs), so proxy those
// paths through to keep the same-origin contract that production has on
// 10.23.80.28.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api':  { target: 'http://127.0.0.1:3000', changeOrigin: false },
      '/auth': { target: 'http://127.0.0.1:3000', changeOrigin: false },
    },
  },
})
