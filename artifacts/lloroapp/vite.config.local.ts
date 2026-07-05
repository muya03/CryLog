// vite.config.local.ts — Para desarrollo LOCAL (Mac M1 / otros sistemas)
// USO: PORT=3000 BASE_PATH=/ pnpm --filter @workspace/lloroapp exec vite --config vite.config.local.ts
// O simplemente usa el script: scripts/dev-local.sh

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// En local, PORT y BASE_PATH son opcionales (tienen defaults sensatos)
const port = Number(process.env.PORT ?? 3000);
const basePath = process.env.BASE_PATH ?? "/";
const apiPort = Number(process.env.API_PORT ?? 8080);

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    // Los plugins de Replit (@replit/vite-plugin-*) NO se cargan en local
    // porque dependen del entorno de Replit (REPL_ID, etc.)
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    // En Replit, el proxy inverso de la plataforma redirige /api → Express.
    // En local, Vite hace ese proxy directamente.
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
      // El middleware de Clerk también corre en Express
      "/clerk": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
