import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = Number(process.env.API_PORT || 8787);

const CSP_META_TAG_RE = /<meta\s+[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi;

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    {
      // Vite dev server injects inline styles and uses websocket connections for HMR.
      // Keeping a strict CSP meta tag in dev makes the app look "unstyled" and breaks HMR.
      name: "strip-csp-meta-in-dev",
      transformIndexHtml(html) {
        if (mode === "development") {
          return html.replace(CSP_META_TAG_RE, "");
        }
        return html;
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
}));
