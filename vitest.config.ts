import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    env: {
      VITE_API_BASE_URL:
        "https://gerenciamentoestacionamento-ru6m.onrender.com",
      VITE_CONTATO_EMAIL: "",
    },
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules/**", "dist/**"],
  },
});