import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Base path résolution :
 *  - Local dev (pnpm dev)            → '/'  (Vite default)
 *  - GitHub Actions (Pages deploy)    → '/<repo>/'  (auto via GITHUB_REPOSITORY)
 *  - Override manuel (custom domain)  → VITE_BASE='/'
 */
function resolveBase(): string { return process.env.VITE_BASE || '/'; }

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
    proxy: { "/api": { target: process.env.VITE_API_PROXY || "http://127.0.0.1:8765", changeOrigin: true } },
  },
});
