import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BookmarkMin, Eye } from "../components/icons.js";
import CONFIG from "../config/config.js";
import ApiModel from "../models/api-model.js";
import AuthModel from "../models/auth-model.js";
import StorageModel from "../models/storage-model.js";

class FavoritesView {
	constructor() {
		this.container = null;
		this.apiModel = new ApiModel();
		this.authModel = new AuthModel();
		this.storageModel = new StorageModel();
		this.map = null;
		this.tileLayer = null;
		this.markers = [];
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
      <section>
        <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; text-transform: uppercase;">Cerita Favorit Saya</h2>
        <div class="map-controls">
          <button id="showMapBtn" class="btn btn-secondary">Tampilkan Peta</button>
          <div class="map-layers" style="display: none;">
            <button id="standardMapBtn" class="btn btn-accent">Standar</button>
            <button id="satelliteMapBtn" class="btn btn-accent">Satelit</button>
            <button id="topoMapBtn" class="btn btn-accent">Topografi</button>
          </div>
        </div>
        <div id="mapContainer" class="map-container" style="display: none;"></div>
        
        <div id="favoritesContainer" class="story-grid"></div>
        
        <div id="loadingContainer" class="loading-container" style="display: none;">
          <div class="loading-spinner"></div>
        </div>
        
        <div id="emptyFavorites" style="text-align: center; padding: 2rem; display: none;">
          <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">Anda belum memiliki cerita favorit.</p>
          <a href="#/stories" class="btn">Jelajahi Cerita</a>
        </div>
      </section>
    `;
	}

	async afterRender() {
		const showMapBtn = document.getElementById("showMapBtn");
		const mapContainer = document.getElementById("mapContainer");
		const mapLayers = document.querySelector(".map-layers");

		this.showLoading();
		await this.loadFavoriteStories();
		this.hideLoading();

		showMapBtn.addEventListener("click", () => {
			if (mapContainer.style.display === "none") {
				mapContainer.style.display = "block";
				mapLayers.style.display = "flex";
				showMapBtn.textContent = "Sembunyikan Peta";
				this.initMap();
			} else {
				mapContainer.style.display = "none";
				mapLayers.style.display = "none";
				showMapBtn.textContent = "Tampilkan Peta";
			}
		});

		document.getElementById("standardMapBtn").addEventListener("click", () => {
			this.changeMapLayer("standard");
		});

		document.getElementById("satelliteMapBtn").addEventListener("click", () => {
			this.changeMapLayer("satellite");
		});

		document.getElementById("topoMapBtn").addEventListener("click", () => {
			this.changeMapLayer("topo");
		});
	}

	async loadFavoriteStories() {
		try {
			const favoriteStories = await this.storageModel.getFavoriteStories();

			if (favoriteStories.length === 0) {
				document.getElementById("emptyFavorites").style.display = "block";
				return;
			}

			this.renderFavoriteStories(favoriteStories);
		} catch (error) {
			console.error("Error loading favorite stories:", error);
			this.showErrorMessage("Terjadi kesalahan saat memuat cerita favorit");
		}
	}

	renderFavoriteStories(stories) {
		const favoriteContainer = document.getElementById("favoritesContainer");
		favoriteContainer.innerHTML = "";

		stories.forEach((story, index) => {
			const bgColors = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--blue)"];
			const bgColor = bgColors[index % bgColors.length];
			const textColor = bgColor === "var(--primary)" || bgColor === "var(--blue)" ? "white" : "var(--dark)";

			const truncatedDescription = story.description.length > 60 ? story.description.substring(0, 60) + "..." : story.description;

			const storyElement = document.createElement("div");
			storyElement.id = `favorite-${story.id}`;
			storyElement.className = "card";
			storyElement.style.backgroundColor = bgColor;
			storyElement.style.color = textColor;
			storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}" class="card-image">
        <h3 class="card-title">${story.name}</h3>
        <p class="card-content" title="${story.description}">${truncatedDescription}</p>
        <div class="card-footer">
          <span>${new Date(story.createdAt).toLocaleDateString()}</span>
          <div class="story-actions">
            <a href="#/detail/${story.id}" class="btn" style="background-color: var(--dark); color: white;">${Eye()}</a>
            <button class="btn btn-secondary remove-favorite" data-id="${story.id}">${BookmarkMin()}</button>
          </div>
        </div>
      `;

			favoriteContainer.appendChild(storyElement);
		});

		document.querySelectorAll(".remove-favorite").forEach((button) => {
			console.log("HASIL BUTTON : ", button);
			button.addEventListener("click", async (e) => {
				const storyId = e.target.dataset.id;
				console.log("HASL DSFLKJSDLFJ : ", storyId);
				await this.removeFavorite(storyId);
			});
		});
	}

	async removeFavorite(storyId) {
		console.log("STORY ID : ", storyId);
		try {
			await this.storageModel.removeFavoriteStory(storyId);

			const storyElement = document.getElementById(`favorite-${storyId}`);
			if (storyElement) {
				storyElement.remove();
			}

			const favoriteStories = await this.storageModel.getFavoriteStories();
			if (favoriteStories.length === 0) {
				document.getElementById("emptyFavorites").style.display = "block";
			}

			if (this.map) {
				this.updateMapMarkers(favoriteStories);
			}
		} catch (error) {
			console.error("Error removing favorite story:", error);
			this.showErrorMessage("Terjadi kesalahan saat menghapus dari favorit");
		}
	}

	showLoading() {
		document.getElementById("loadingContainer").style.display = "flex";
	}

	hideLoading() {
		document.getElementById("loadingContainer").style.display = "none";
	}

	showErrorMessage(message) {
		const favoritesContainer = document.getElementById("favoritesContainer");
		favoritesContainer.innerHTML = `
      <div class="alert alert-error">
        Gagal memuat favorit: ${message}
      </div>
    `;
	}

	initMap() {
		if (this.map) return;

		this.map = L.map("mapContainer").setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

		this.changeMapLayer("standard");

		this.loadFavoriteStories().then(async () => {
			const favoriteStories = await this.storageModel.getFavoriteStories();
			this.updateMapMarkers(favoriteStories);
		});
	}

	changeMapLayer(type) {
		if (!this.map) return;

		if (this.tileLayer) {
			this.map.removeLayer(this.tileLayer);
		}

		switch (type) {
			case "satellite":
				this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.SATELLITE.URL, {
					attribution: CONFIG.TILE_LAYERS.SATELLITE.ATTRIBUTION,
				});
				break;
			case "topo":
				this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.TOPO.URL, {
					attribution: CONFIG.TILE_LAYERS.TOPO.ATTRIBUTION,
				});
				break;
			default:
				this.tileLayer = L.tileLayer(CONFIG.TILE_LAYERS.STANDARD.URL, {
					attribution: CONFIG.TILE_LAYERS.STANDARD.ATTRIBUTION,
				});
		}

		this.tileLayer.addTo(this.map);
	}

	updateMapMarkers(stories) {
		if (!this.map) return;

		this.markers.forEach((marker) => this.map.removeLayer(marker));
		this.markers = [];

		stories.forEach((story) => {
			if (story.lat && story.lon) {
				const marker = L.marker([story.lat, story.lon]).addTo(this.map);

				marker.bindPopup(`
          <strong>${story.name}</strong><br>
          ${story.description.substring(0, 100)}${story.description.length > 100 ? "..." : ""}<br>
          <a href="#/detail/${story.id}">${Eye()}</a>
        `);

				this.markers.push(marker);
			}
		});

		if (this.markers.length > 0) {
			const group = new L.featureGroup(this.markers);
			this.map.fitBounds(group.getBounds());
		}
	}
}

export default FavoritesView;
