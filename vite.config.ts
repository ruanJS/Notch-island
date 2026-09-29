import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": resolve(import.meta.dirname, "src/app"),
      "@assets": resolve(import.meta.dirname, "src/assets"),
      "@onboarding": resolve(import.meta.dirname, "src/onboarding"),
      "@widget": resolve(import.meta.dirname, "src/widget"),
      "@providers": resolve(import.meta.dirname, "src/providers"),
      "@usage": resolve(import.meta.dirname, "src/usage"),
      "@alerts": resolve(import.meta.dirname, "src/alerts"),
      "@notchi": resolve(import.meta.dirname, "src/notchi"),
      "@settings": resolve(import.meta.dirname, "src/settings"),
      "@shared": resolve(import.meta.dirname, "src/shared"),
      "@styles": resolve(import.meta.dirname, "src/styles"),
    },
  },
  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
