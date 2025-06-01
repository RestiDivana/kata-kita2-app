import CONFIG from "../config/config.js";

class StorageModel {
  constructor() {
    this.dbPromise = this.openIndexedDB();
  }

  async openIndexedDB() {
    if (!window.indexedDB) {
      console.error("Browser tidak mendukung IndexedDB");
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DATABASE_NAME, 1);

      request.onerror = (event) => {
        console.error("Error membuka IndexedDB:", event.target.error);
        reject(event.target.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Buat object store untuk stories jika belum ada
        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME.STORIES)) {
          const storyStore = db.createObjectStore(CONFIG.OBJECT_STORE_NAME.STORIES, { keyPath: "id" });
          storyStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Buat object store untuk favorites jika belum ada
        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME.FAVORITES)) {
          const favoriteStore = db.createObjectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES, { keyPath: "id" });
          favoriteStore.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        console.log("IndexedDB berhasil dibuka");
        resolve(event.target.result);
      };
    });
  }

  // Simpan banyak stories sekaligus
  async saveStories(stories) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.STORIES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.STORIES);

      stories.forEach((story) => {
        store.put(story);
      });

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });

      return true;
    } catch (error) {
      console.error("Error menyimpan stories ke IndexedDB:", error);
      return false;
    }
  }

  // Ambil semua stories
  async getStories() {
    try {
      const db = await this.dbPromise;
      if (!db) return [];

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.STORIES, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.STORIES);
      const index = store.index("createdAt");

      return await new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error("Error mengambil stories dari IndexedDB:", error);
      return [];
    }
  }

  // Ambil story berdasarkan ID
  async getStoryById(id) {
    try {
      const db = await this.dbPromise;
      if (!db) return null;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.STORIES, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.STORIES);

      return await new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error(`Error mengambil story dengan id ${id} dari IndexedDB:`, error);
      return null;
    }
  }

  // Simpan favorite story
  async saveFavoriteStory(story) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);

      store.put(story);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });

      return true;
    } catch (error) {
      console.error("Error menyimpan favorite story ke IndexedDB:", error);
      return false;
    }
  }

  // Hapus favorite story berdasarkan ID
  async removeFavoriteStory(id) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);

      store.delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });

      return true;
    } catch (error) {
      console.error(`Error menghapus favorite story dengan id ${id} dari IndexedDB:`, error);
      return false;
    }
  }

  // Ambil semua favorite stories
  async getFavoriteStories() {
    try {
      const db = await this.dbPromise;
      if (!db) return [];

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);
      const index = store.index("createdAt");

      return await new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error("Error mengambil favorite stories dari IndexedDB:", error);
      return [];
    }
  }

  // Cek apakah story sudah difavoritkan
  async isFavorite(id) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);

      return await new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error(`Error memeriksa favorite status untuk story dengan id ${id}:`, error);
      return false;
    }
  }
}

export default StorageModel;
