import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = loadEnv(mode, path.resolve(process.cwd(), "../desenvWebBack"), "");
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: { "/api": { target: env.API_PROXY_TARGET || "http://localhost:" + (backend.PORT || 3000), changeOrigin: true, rewrite: path => path.replace(/^\/api/, "") } },
    },
  };
});
