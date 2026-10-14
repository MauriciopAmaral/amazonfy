import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento, /api é repassado para a API PHP local (rode "npm run api"
// em outro terminal). A pasta /uploads é servida pelo próprio Vite, que suporta
// avançar/voltar no áudio (requisições Range).
const API_DEV_URL = process.env.API_DEV_URL || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: API_DEV_URL, changeOrigin: false },
    },
  },
  build: {
    target: "es2020",
  },
});
