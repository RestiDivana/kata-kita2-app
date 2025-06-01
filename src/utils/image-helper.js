const ImageHelper = {
  /**
   * Mengkonversi URL gambar menjadi string base64
   * @param {string} url - URL gambar yang akan dikonversi
   * @returns {Promise<string|null>} - String base64 dari gambar atau null jika gagal
   */
  async urlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Gagal membaca blob gambar"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  },

  /**
   * Mengecek apakah sebuah string merupakan gambar base64
   * @param {string} str - String yang akan dicek
   * @returns {boolean} - true jika string merupakan gambar base64
   */
  isBase64Image(str) {
    return typeof str === "string" && str.startsWith("data:image/");
  },
};

export default ImageHelper;
