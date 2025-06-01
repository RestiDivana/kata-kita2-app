import { resolve } from "path"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  base: "./",
  publicDir: "./public",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html")
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets"
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 31536000
              }
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "map-tiles",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800
              }
            }
          }
        ]
      },
      includeAssets: ["icons/*.{png,svg,ico}", "screenshots/*.png"],
      manifest: {
        name: "KataKita - Cerita dan Ekspresi",
        short_name: "KataKita",
        description: "Platform untuk berbagi kata, cerita, dan ekspresi",
        start_url: "./index.html",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#3F51B5",
        icons: [
          {
            src: "./icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "Tulis Cerita",
            short_name: "Tulis",
            description: "Tulis ekspresi dan ceritamu",
            url: "./#/add",
            icons: [
              {
                src: "./icons/add-story-192x192.png",
                sizes: "192x192"
              }
            ]
          },
          {
            name: "Jelajahi Cerita",
            short_name: "Jelajahi",
            description: "Lihat cerita dari pengguna lain",
            url: "./#/stories",
            icons: [
              {
                src: "./icons/view-stories-192x192.png",
                sizes: "192x192"
              }
            ]
          }
        ],
        screenshots: [
          {
            src: "./screenshots/desktop-home.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
            label: "Beranda KataKita Desktop"
          },
          {
            src: "./screenshots/desktop-stories.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
            label: "Halaman Cerita Desktop"
          },
          {
            src: "./screenshots/mobile-home.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Beranda KataKita Mobile"
          },
          {
            src: "./screenshots/mobile-stories.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Halaman Cerita Mobile"
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    open: true
  }
})
