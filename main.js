import App from "./src/app.js"
import { registerSW } from "virtual:pwa-register"

document.addEventListener("DOMContentLoaded", () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm("Ada pembaruan baru tersedia. Muat ulang halaman?")) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log("Aplikasi siap digunakan secara offline")
    },
  })

  const app = new App()
  app.init()
})
