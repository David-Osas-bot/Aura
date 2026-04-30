import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // ← add this
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": "https://aura-production-40f7.up.railway.app",
    },
  },
});