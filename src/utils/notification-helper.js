import CONFIG from "../config/config.js";

const NotificationHelper = {
  async requestPermission() {
    if (!("Notification" in window)) {
      console.error("Browser ini tidak mendukung notifikasi");
      return false;
    }

    const result = await Notification.requestPermission();
    if (result === "denied") {
      console.warn("Fitur notifikasi tidak diizinkan");
      return false;
    }

    if (result === "default") {
      console.warn("Pengguna menutup dialog permintaan izin");
      return false;
    }

    return true;
  },

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.error("ServiceWorker tidak didukung di browser ini");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log("ServiceWorker siap digunakan");
      return registration;
    } catch (error) {
      console.error("ServiceWorker error:", error);
      return null;
    }
  },

  async subscribePushNotification(registration) {
    try {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY),
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log(
        "Berhasil melakukan subscribe dengan p256dh key:",
        btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh"))))
      );

      await this.sendSubscriptionToServer(subscription);
      this.updateServiceWorkerSubscriptionState(true);

      return subscription;
    } catch (error) {
      console.error("Gagal melakukan subscribe:", error);
      return null;
    }
  },

  async unsubscribePushNotification(registration) {
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      await this.sendUnsubscriptionToServer(subscription);
      await subscription.unsubscribe();
      console.log("Berhasil berhenti berlangganan");

      this.updateServiceWorkerSubscriptionState(false);
    } catch (error) {
      console.error("Gagal berhenti berlangganan:", error);
    }
  },

  updateServiceWorkerSubscriptionState(isSubscribed) {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SUBSCRIPTION_STATE",
        isSubscribed,
      });
    }
  },

  async sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN);
    try {
      const url = `${CONFIG.BASE_URL}/notifications/subscribe`;
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh")))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))),
          },
        }),
      });

      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log("Subscription berhasil dikirim ke server");
      return responseJson;
    } catch (error) {
      console.error("Gagal mengirim subscription ke server:", error);
      throw error;
    }
  },

  async sendUnsubscriptionToServer(subscription) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN);
    try {
      const url = `${CONFIG.BASE_URL}/notifications/subscribe`;
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log("Unsubscription berhasil dikirim ke server");
      return responseJson;
    } catch (error) {
      console.error("Gagal mengirim unsubscription ke server:", error);
      throw error;
    }
  },

  urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  },

  async showNotification(title, options = {}) {
    if (!("Notification" in window)) {
      console.error("Browser tidak mendukung notifikasi");
      return;
    }

    if (Notification.permission !== "granted") {
      console.error("Izin notifikasi belum diberikan");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        console.warn("Service worker tidak terdaftar, tidak dapat menampilkan notifikasi");
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.warn("Tidak ada langganan push, tidak menampilkan notifikasi");
        return;
      }

      registration.showNotification(title, {
        icon: "./icons/icon-192x192.png",
        badge: "./icons/badge-72x72.png",
        ...options,
      });
    } catch (error) {
      console.error("Gagal menampilkan notifikasi:", error);
    }
  },

  async isNotificationEnabled() {
    if (Notification.permission !== "granted") {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error("Error checking notification status:", error);
      return false;
    }
  },
};

export default NotificationHelper;
