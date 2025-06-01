import DetailStoryPresenter from "../presenters/detail-story-presenter.js"
import ApiModel from "../models/api-model.js"
import AuthModel from "../models/auth-model.js"
import CONFIG from "../config/config.js"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

class DetailStoryView {
	constructor(id) {
		this.container = null;
		this.id = id;
		this.apiModel = new ApiModel();
		this.authModel = new AuthModel();
		this.presenter = new DetailStoryPresenter(this, this.apiModel, this.authModel, this.id);
		this.map = null;
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
    <section id="storyDetailContainer">
      <div class="loading" style="text-align: center; font-size: 1.5rem; font-weight: bold; padding: 2rem;">Memuat detail cerita...</div>
    </section>
  `;
	}

	async afterRender() {
		await this.presenter.loadStoryDetail();
	}

	showLoading() {
		document.getElementById("storyDetailContainer").innerHTML = `
      <div class="loading" style="text-align: center; font-size: 1.5rem; font-weight: bold; padding: 2rem;">
        <div class="loading-spinner"></div>
        <p>Memuat detail cerita...</p>
      </div>
    `;
	}

	renderStoryDetail(story, isFavorite = false) {
		const storyDetailContainer = document.getElementById("storyDetailContainer");

		storyDetailContainer.innerHTML = `
    <div class="card" style="background-color: var(--secondary); max-width: 800px; margin: 0 auto;">
      <a href="#/stories" class="btn" style="display: inline-block; margin-bottom: 1.5rem;">← Kembali ke Cerita</a>
      
      <h2 class="card-title" style="font-size: 2.5rem;">${story.name}</h2>
      
      <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}" class="card-image" style="max-height: 500px; object-fit: contain;">
      
      <p class="card-content" style="font-size: 1.2rem; margin: 1.5rem 0;">${story.description}</p>
      
      <div class="card-footer" style="background-color: var(--accent); padding: 1rem; border: var(--border); margin-top: 1.5rem;">
        <span style="font-weight: bold;">Diposting pada: ${new Date(story.createdAt).toLocaleString()}</span>
        <button id="favoriteBtn" class="btn ${isFavorite ? "btn-secondary" : ""}" style="margin-left: 1rem;">
          ${isFavorite ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
        </button>
      </div>
      
      ${
			story.lat && story.lon
				? `
        <div class="location-info" style="margin-top: 2rem;">
          <h3 style="font-size: 1.8rem; margin-bottom: 1rem; text-transform: uppercase;">Lokasi</h3>
          <p style="font-weight: bold; margin-bottom: 1rem;">Latitude: ${story.lat}, Longitude: ${story.lon}</p>
          <div id="mapContainer" class="map-container"></div>
        </div>
      `
				: ""
		}
    </div>
  `;

		const favoriteBtn = document.getElementById("favoriteBtn");
		favoriteBtn.addEventListener("click", async () => {
			const newStatus = await this.presenter.toggleFavorite();

			favoriteBtn.textContent = newStatus ? "Hapus dari Favorit" : "Tambahkan ke Favorit";
			favoriteBtn.classList.toggle("btn-secondary", newStatus);

			if (newStatus) {
				this.showSuccessMessage("Berhasil menambahkan ke favorit");
			} else {
				this.showSuccessMessage("Berhasil menghapus dari favorit");
			}
		});
	}

	showErrorMessage(message) {
		document.getElementById("storyDetailContainer").innerHTML = `
      <div class="alert alert-error">
        Gagal memuat cerita: ${message}
      </div>
      <a href="#/stories" class="btn">Kembali ke Cerita</a>
    `;
	}

	initMap(lat, lon, name, description) {
		this.map = L.map("mapContainer").setView([lat, lon], 13);

		L.tileLayer(CONFIG.TILE_LAYERS.STANDARD.URL, {
			attribution: CONFIG.TILE_LAYERS.STANDARD.ATTRIBUTION,
		}).addTo(this.map);

		const marker = L.marker([lat, lon]).addTo(this.map);

		marker
			.bindPopup(
				`
      <strong>Cerita ${name}</strong><br>
      ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}
    `
			)
			.openPopup();
	}

	showSuccessMessage(message) {
		const storyDetailContainer = document.getElementById("storyDetailContainer");
		const alertElement = document.createElement("div");
		alertElement.className = "alert alert-success";
		alertElement.style.position = "fixed";
		alertElement.style.top = "20px";
		alertElement.style.right = "20px";
		alertElement.style.zIndex = "9999";
		alertElement.textContent = message;

		storyDetailContainer.appendChild(alertElement);

		setTimeout(() => {
			alertElement.remove();
		}, 3000);
	}
}

export default DetailStoryView;
