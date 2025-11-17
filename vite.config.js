import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BACKEND_PORT = 3001;
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Ez a sor irányítja át az összes /api-val kezdődő hívást a backendre
      "/api": {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
