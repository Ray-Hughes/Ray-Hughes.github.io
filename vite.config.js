import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  build: {
    assetsDir: "assets",
    // three.js, drei and postprocessing land in one chunk of about 1.5 MB
    // (500 KB gzipped). It is only fetched by the 3D pages, never by the
    // plain one, so the default 500 KB warning is noise here.
    chunkSizeWarningLimit: 1700,
  },
  plugins: [react()],
});
