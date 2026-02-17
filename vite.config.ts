import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { version } from "./package.json";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1430,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1431,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**", "**/playwright-report/**"],
    },
  },
  optimizeDeps: {
    entries: ["!playwright-report/**"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": [
            "lucide-react",
            "framer-motion",
            "sonner",
            "@radix-ui/react-icons",
            "clsx",
            "tailwind-merge",
          ],
          "vendor-utils": [
            "date-fns",
            "zod",
            "zustand",
            "kysely",
            "i18next",
            "react-i18next",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
