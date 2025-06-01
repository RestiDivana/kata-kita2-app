import CONFIG from "../config/config.js";
import ImageHelper from "../utils/image-helper.js";

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

        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME.STORIES)) {
          const storyStore = db.createObjectStore(CONFIG.OBJECT_STORE_NAME.STORIES, { keyPath: "id" });
          storyStore.createIndex("createdAt", "createdAt", { unique: false });
        }

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

  async saveStories(stories) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      // Konversi photoUrl ke base64 jika belum
      const storiesWithBase64Images = await Promise.all(
        stories.map(async (story) => {
          if (story.photoUrl && !ImageHelper.isBase64Image(story.photoUrl)) {
            try {
              const base64Image = await ImageHelper.urlToBase64(story.photoUrl);
              if (base64Image) {
                return { ...story, photoUrl: base64Image, originalPhotoUrl: story.photoUrl };
              }
            } catch (error) {
              console.error(`Error konversi gambar ke base64 untuk story ${story.id}:`, error);
            }
          }
          return story;
        })
      );

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.STORIES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.STORIES);

      storiesWithBase64Images.forEach((story) => {
        store.put(story);
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => {
          console.error("Transaction error:", e.target.error);
          reject(e.target.error);
        };
      });
    } catch (error) {
      console.error("Error menyimpan stories ke IndexedDB:", error);
      return false;
    }
  }

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

  async saveFavoriteStory(story) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      let storyToSave = { ...story };
      if (story.photoUrl && !ImageHelper.isBase64Image(story.photoUrl)) {
        try {
          const base64Image = await ImageHelper.urlToBase64(story.photoUrl);
          if (base64Image) {
            storyToSave = { ...story, photoUrl: base64Image, originalPhotoUrl: story.photoUrl };
          }
        } catch (error) {
          console.error(`Error konversi gambar ke base64 untuk favorite story ${story.id}:`, error);
        }
      }

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);

      store.put(storyToSave);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => {
          console.error("Transaction error:", e.target.error);
          reject(e.target.error);
        };
      });
    } catch (error) {
      console.error("Error menyimpan favorite story ke IndexedDB:", error);
      return false;
    }
  }

  async removeFavoriteStory(id) {
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME.FAVORITES, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME.FAVORITES);

      store.delete(id);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error(`Error menghapus favorite story dengan id ${id} dari IndexedDB:`, error);
      return false;
    }
  }

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
