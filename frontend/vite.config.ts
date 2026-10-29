import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "IntelliGreen Field Technician Portal",
        short_name: "IntelliGreen",

        description:
          "IntelliGreen Technologies Field Service & Air Quality Reporting Platform",
        theme_color: "#0f766e",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        scope: "/",

        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            src: "maskable-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        "screenshots": [
        {
          "src": "/ScreenshotMobile.png",
          "sizes": "1254x1254",
          "type": "image/png"
        },
        {
          "src": "/ScreenshotDesktop.png",
          "sizes": "1254x1254",
          "type": "image/png",
          "form_factor": "wide"
        }
        ],
      },  

      workbox: {
        cleanupOutdatedCaches: true,

        clientsClaim: true,

        skipWaiting: true,
      },
    }),
  ],
});