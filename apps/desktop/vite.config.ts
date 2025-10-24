import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  // 生产环境使用相对路径，确保通过 file:// 协议加载静态资源
  base: "./",
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: "electron/preload.ts",
        vite: {
          build: {
            outDir: "dist-electron"
          }
        }
      }
    ]),
    renderer()
  ],
  server: {
    port: 5174
  }
});

