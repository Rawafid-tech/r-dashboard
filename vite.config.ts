import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Avoid browser CORS in local dev by proxying API through Vite
      "/api": {
        target: "https://rawafid.softizone.net",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
