import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

// Exercise the deployed policy in preview/browser tests, not Vite's development permissions.
const renderPolicy = readFileSync(resolve(__dirname, 'render.yaml'), 'utf8')
  .match(/name: Content-Security-Policy\s+value: "([^"]+)"/)?.[1];
if (!renderPolicy) throw new Error('Content-Security-Policy missing from render.yaml');

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
  preview: {
    headers: {
      'Content-Security-Policy': renderPolicy,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
