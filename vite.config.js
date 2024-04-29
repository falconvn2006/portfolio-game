import { defineConfig } from "vite";

export default defineConfig({
    base: "/portfolio-game",
    build: {
        minify: "terser",
    }
})