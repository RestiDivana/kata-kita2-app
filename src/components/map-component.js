import L from "leaflet"
import "leaflet/dist/leaflet.css"
import CONFIG from "../config/config.js"

class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId
    this.options = {
      center: options.center || CONFIG.DEFAULT_MAP_CENTER,
      zoom: options.zoom || CONFIG.DEFAULT_MAP_ZOOM,
      ...options,
    }
    this.map = null
    this.tileLayer = null
    this.markers = []
  }

  init() {
    this.map = L.map(this.containerId).setView(this.options.center, this.options.zoom)
    this.setTileLayer("standard")
    return this.map
  }

  setTileLayer(type) {
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer)
    }

    switch (type) {
      case "satellite":
        this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.SATELLITE.URL, {
          attribution: CONFIG.TILE_LAYERS.SATELLITE.ATTRIBUTION,
        })
        break
      case "topo":
        this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.TOPO.URL, {
          attribution: CONFIG.TILE_LAYERS.TOPO.ATTRIBUTION,
        })
        break
      default:
        this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.STANDARD.URL, {
          attribution: CONFIG.TILE_LAYERS.STANDARD.ATTRIBUTION,
        })
    }

    this.tileLayer.addTo(this.map)
    return this.tileLayer
  }

  addMarker(lat, lng, popupContent = null) {
    const marker = L.marker([lat, lng]).addTo(this.map)

    if (popupContent) {
      marker.bindPopup(popupContent)
    }

    this.markers.push(marker)
    return marker
  }

  clearMarkers() {
    this.markers.forEach((marker) => this.map.removeLayer(marker))
    this.markers = []
  }

  fitBounds() {
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers)
      this.map.fitBounds(group.getBounds())
    }
  }
}

export default MapComponent

