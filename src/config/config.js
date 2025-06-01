const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
  DEFAULT_MAP_CENTER: [0, 0],
  DEFAULT_MAP_ZOOM: 2,
  DEFAULT_PAGE_SIZE: 10,
  STORAGE_KEY: {
    TOKEN: "token",
    USER_ID: "userId",
    NAME: "name",
  },
  TILE_LAYERS: {
    STANDARD: {
      URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ATTRIBUTION: "&copy; OpenStreetMap contributors",
    },
    SATELLITE: {
      URL: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ATTRIBUTION:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    TOPO: {
      URL: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      ATTRIBUTION: "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
    },
  },
  // Tambahan konfigurasi IndexedDB
  DATABASE_NAME: "katakita-db",
  OBJECT_STORE_NAME: {
    STORIES: "stories",
    FAVORITES: "favorites",
  },
};

export default CONFIG;
