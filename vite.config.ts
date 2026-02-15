import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = Number(process.env.API_PORT || 8787);

export default defineConfig({
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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
