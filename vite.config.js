import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default ({ mode }) => {
    return defineConfig({
        base: (mode == "production") ? "/__xpr__/pub_engine/admin-react-rebuild/web/" : "/",
        server: {
            port: 3000,
            proxy: {
                "/__xpr__": {
                    target: "https://www.mousegraphics.eu",
                    changeOrigin: true
                },
                "/api": {
                    target: "https://www.mousegraphics.eu",
                    changeOrigin: true
                },
                "/media": {
                    target: "https://www.mousegraphics.eu",
                    changeOrigin: true
                }
            }
        },
        css: {
            devSourcemap: true
        },
        build: {
            outDir: "xpr/web",
            rollupOptions: {
                output: {
                    assetFileNames: "assets/[name]-[hash][extname]",
                    chunkFileNames: "[name]-[hash].js",
                    entryFileNames: "[name]-[hash].js"
                }
            }
        },
        plugins: [react({
            jsxImportSource: "@emotion/react"
        })],
        define: {
            APP_VERSION: JSON.stringify(process.env.npm_package_version)
        },
        resolve: {
            alias: {
                "@src": resolve(__dirname, "./src"),
                "@components": resolve(__dirname, "./src/components"),
                "@context": resolve(__dirname, "./src/context"),
                "@assets": resolve(__dirname, "./src/assets"),
                "@public": resolve(__dirname, "./public")
            }
        }
    })
}