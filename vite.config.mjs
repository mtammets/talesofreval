import { defineConfig } from "vite";

const backendPort = Number(process.env.BACKEND_PORT || 5020);
const backendTarget = `http://127.0.0.1:${backendPort}`;

export default defineConfig({
  root: "site",
  publicDir: false,
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true
      },
      "/email": {
        target: backendTarget,
        changeOrigin: true
      },
      "/uploads": {
        target: backendTarget,
        changeOrigin: true
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
