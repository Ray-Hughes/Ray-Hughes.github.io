import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ray-hughes.github.io/",
  build: {
    assetsDir: "assets",
  },
  plugins: [react()],
});
