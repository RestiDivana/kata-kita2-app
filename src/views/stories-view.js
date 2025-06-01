import StoriesPresenter from "../presenters/stories-presenter.js"
import ApiModel from "../models/api-model.js"
import AuthModel from "../models/auth-model.js"
import CONFIG from "../config/config.js"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { BookmarkMin, BookmarkPlus, Eye } from "../components/icons.js";

class StoriesView {
	constructor() {
		this.container = null;
		this.apiModel = new ApiModel();
		this.authModel = new AuthModel();
		this.presenter = new StoriesPresenter(this, this.apiModel, this.authModel);
		this.map = null;
		this.tileLayer = null;
		this.markers = [];
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
      <section>
        <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; text-transform: uppercase;">Cerita</h2>
        <div class="map-controls">
          <button id="showMapBtn" class="btn btn-secondary">Tampilkan Peta</button>
          <div class="map-layers" style="display: none;">
            <button id="standardMapBtn" class="btn btn-accent">Standar</button>
            <button id="satelliteMapBtn" class="btn btn-accent">Satelit</button>
            <button id="topoMapBtn" class="btn btn-accent">Topografi</button>
          </div>
        </div>
        <div id="mapContainer" class="map-container" style="display: none;"></div>
        
        <div id="storiesContainer" class="story-grid"></div>
        
        <div id="loadingContainer" class="loading-container" style="display: none;">
          <div class="loading-spinner"></div>
        </div>
        
        <div id="loadMoreContainer" class="load-more-container" style="text-align: center; margin-top: 2rem;">
          <button id="loadMoreBtn" class="btn">Muat Lebih Banyak</button>
        </div>
      </section>
    `;
	}

	async afterRender() {
		const loadMoreBtn = document.getElementById("loadMoreBtn");
		const showMapBtn = document.getElementById("showMapBtn");
		const mapContainer = document.getElementById("mapContainer");
		const mapLayers = document.querySelector(".map-layers");

		this.showLoading();
		this.presenter.loadStories();
		this.hideLoading();

		loadMoreBtn.addEventListener("click", () => {
			this.presenter.loadMoreStories();
		});

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

	renderStories(stories) {
		const storiesContainer = document.getElementById("storiesContainer");

		stories.forEach(async (story, index) => {
			if (document.getElementById(`story-${story.id}`)) {
				return;
			}

			const bgColors = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--blue)"];
			const bgColor = bgColors[index % bgColors.length];
			const textColor = bgColor === "var(--primary)" || bgColor === "var(--blue)" ? "white" : "var(--dark)";

			const truncatedDescription = story.description.length > 60 ? story.description.substring(0, 60) + "..." : story.description;

			const isFavorite = await this.presenter.checkFavoriteStatus(story.id);

			const storyElement = document.createElement("div");
			storyElement.id = `story-${story.id}`;
			storyElement.className = "card";
			storyElement.style.backgroundColor = bgColor;
			storyElement.style.color = textColor;
			storyElement.innerHTML = `
      <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}" class="card-image">
      <h3 class="card-title">${story.name}</h3>
      <p class="card-content" title="${story.description}">${truncatedDescription}</p>
      <div class="card-footer">
        <span>${new Date(story.createdAt).toLocaleDateString()}</span>
        <div class="card-actions">
          <a href="#/detail/${story.id}" class="btn" style="background-color: var(--dark); color: white;">${Eye()}</a>
          <button class="favorite-btn btn ${isFavorite ? "btn-secondary" : ""}" data-id="${story.id}">
            ${isFavorite ? BookmarkMin() : BookmarkPlus()}
          </button>
        </div>
      </div>
    `;

			storiesContainer.appendChild(storyElement);

			const favoriteBtn = storyElement.querySelector(".favorite-btn");
			favoriteBtn.addEventListener("click", async (e) => {
				e.preventDefault();
				const storyId = e.target.dataset.id;
				const newStatus = await this.presenter.toggleFavorite(storyId);

				e.target.innerHTML = newStatus ? BookmarkMin() : BookmarkPlus();
				e.target.classList.toggle("btn-secondary", newStatus);
			});
		});
	}

	showLoading() {
		document.getElementById("loadingContainer").style.display = "flex";
		document.getElementById("loadMoreBtn").disabled = true;
	}

	hideLoading() {
		document.getElementById("loadingContainer").style.display = "none";
		document.getElementById("loadMoreBtn").disabled = false;
	}

	updateLoadMoreButton(hasMore) {
		const loadMoreBtn = document.getElementById("loadMoreBtn");
		loadMoreBtn.style.display = hasMore ? "inline-block" : "none";
	}

	showErrorMessage(message) {
		document.getElementById("storiesContainer").innerHTML = `
      <div class="alert alert-error">
        Gagal memuat cerita: ${message}
      </div>
    `;
	}

	isMapInitialized() {
		return this.map !== null;
	}

	initMap() {
		if (this.map) return;

		this.map = L.map("mapContainer").setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

		this.changeMapLayer("standard");

		this.updateMapMarkers(this.presenter.stories);
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

export default StoriesView;
