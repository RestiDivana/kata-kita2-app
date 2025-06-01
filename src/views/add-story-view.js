import AddStoryPresenter from "../presenters/add-story-presenter.js";
import ApiModel from "../models/api-model.js"
import AuthModel from "../models/auth-model.js"
import CONFIG from "../config/config.js"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

class AddStoryView {
	constructor() {
		this.container = null;
		this.apiModel = new ApiModel();
		this.authModel = new AuthModel();
		this.presenter = new AddStoryPresenter(this, this.apiModel, this.authModel);
		this.map = null;
		this.marker = null;
		this.selectedLocation = null;
		this.stream = null;
		this.photoBlob = null;
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
      <section class="form-container" style="background-color: var(--blue); color: white; max-width: 800px;">
        <h2 class="form-title">Bagikan Cerita Anda</h2>
        <div id="alertContainer"></div>
        
        <form id="addStoryForm">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="4" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="photo">Foto</label>
            <div class="camera-container">
              <div id="cameraPreview" class="camera-preview">
                <p>Pratinjau kamera akan muncul di sini</p>
              </div>
              <div class="camera-controls">
                <button type="button" id="startCameraBtn" class="btn">Mulai Kamera</button>
                <button type="button" id="takePictureBtn" class="btn" disabled>Ambil Foto</button>
                <button type="button" id="retakePictureBtn" class="btn" style="display: none;">Ambil Ulang</button>
              </div>
            </div>
            <p style="margin-top: 1rem; font-weight: bold;">Atau unggah foto:</p>
            <input type="file" id="photoInput" name="photo" accept="image/*" style="background-color: white; margin-top: 0.5rem;">
          </div>
          
          <div class="form-group">
            <label for="location">Lokasi (Klik pada peta untuk menetapkan lokasi)</label>
            <div id="mapContainer" class="map-container"></div>
            <div id="locationInfo" style="background-color: var(--accent); padding: 0.5rem; border: var(--border); margin-top: 0.5rem; font-weight: bold;">Belum ada lokasi dipilih</div>
            <button type="button" id="clearLocationBtn" class="btn btn-secondary" style="display: none; margin-top: 0.5rem;">Hapus Lokasi</button>
          </div>
          
          <div id="loadingContainer" class="loading-container" style="display: none;">
            <div class="loading-spinner"></div>
          </div>
          
          <button type="submit" id="submitButton" class="btn" style="margin-top: 2rem; width: 100%;">Bagikan Cerita</button>
        </form>
      </section>
    `;
	}

	afterRender() {
		if (!navigator.onLine) {
			this.showOfflineWarning();
		}

		this.initMap();
		this.initCamera();
		this.initForm();

		window.addEventListener("hashchange", this.handleHashChange.bind(this));

		window.addEventListener("online", () => {
			const warningElement = document.getElementById("offlineWarning");
			if (warningElement) {
				warningElement.remove();
			}
		});

		window.addEventListener("offline", () => {
			this.showOfflineWarning();
		});
	}

	destroy() {
		this.stopCameraStream();
		window.removeEventListener("hashchange", this.handleHashChange.bind(this));
	}

	handleHashChange() {
		this.stopCameraStream();
	}

	initMap() {
		this.map = L.map("mapContainer").setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

		L.tileLayer(CONFIG.TILE_LAYERS.STANDARD.URL, {
			attribution: CONFIG.TILE_LAYERS.STANDARD.ATTRIBUTION,
		}).addTo(this.map);

		this.map.on("click", (e) => {
			const { lat, lng } = e.latlng;

			if (this.marker) {
				this.map.removeLayer(this.marker);
			}

			this.marker = L.marker([lat, lng]).addTo(this.map);
			this.selectedLocation = { lat, lon: lng };
			document.getElementById("locationInfo").textContent = `Dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
			document.getElementById("clearLocationBtn").style.display = "block";
		});

		document.getElementById("clearLocationBtn").addEventListener("click", () => {
			if (this.marker) {
				this.map.removeLayer(this.marker);
				this.marker = null;
			}

			this.selectedLocation = null;
			document.getElementById("locationInfo").textContent = "Belum ada lokasi dipilih";
			document.getElementById("clearLocationBtn").style.display = "none";
		});
	}

	async initCamera() {
		const startCameraBtn = document.getElementById("startCameraBtn");
		const takePictureBtn = document.getElementById("takePictureBtn");
		const retakePictureBtn = document.getElementById("retakePictureBtn");
		const cameraPreview = document.getElementById("cameraPreview");

		startCameraBtn.addEventListener("click", async () => {
			try {
				this.stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
				});

				const videoElement = document.createElement("video");
				videoElement.srcObject = this.stream;
				videoElement.autoplay = true;
				videoElement.id = "cameraVideo";
				videoElement.style.width = "100%";
				videoElement.style.height = "100%";

				cameraPreview.innerHTML = "";
				cameraPreview.appendChild(videoElement);

				takePictureBtn.disabled = false;
				startCameraBtn.disabled = true;
			} catch (error) {
				console.error("Error mengakses kamera:", error);
				cameraPreview.innerHTML = `
          <p>Error mengakses kamera: ${error.message}</p>
          <p>Silakan gunakan opsi unggah file sebagai gantinya.</p>
        `;
			}
		});

		takePictureBtn.addEventListener("click", () => {
			const videoElement = document.getElementById("cameraVideo");

			if (!videoElement) return;

			const canvas = document.createElement("canvas");
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;

			const context = canvas.getContext("2d");
			context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

			const imageElement = document.createElement("img");
			imageElement.id = "capturedImage";
			imageElement.src = canvas.toDataURL("image/jpeg");
			imageElement.style.width = "100%";
			imageElement.style.height = "100%";

			canvas.toBlob(
				(blob) => {
					this.photoBlob = blob;
				},
				"image/jpeg",
				0.8
			);

			this.stopCameraStream();

			cameraPreview.innerHTML = "";
			cameraPreview.appendChild(imageElement);

			takePictureBtn.style.display = "none";
			retakePictureBtn.style.display = "block";
			startCameraBtn.disabled = true;
		});

		retakePictureBtn.addEventListener("click", () => {
			this.photoBlob = null;
			cameraPreview.innerHTML = "<p>Pratinjau kamera akan muncul di sini</p>";

			takePictureBtn.style.display = "inline-block";
			takePictureBtn.disabled = true;
			retakePictureBtn.style.display = "none";
			startCameraBtn.disabled = false;
		});
	}

	stopCameraStream() {
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}
	}

	initForm() {
		const addStoryForm = document.getElementById("addStoryForm");
		const photoInput = document.getElementById("photoInput");
		const cameraPreview = document.getElementById("cameraPreview");

		photoInput.addEventListener("change", (e) => {
			if (photoInput.files.length > 0) {
				const file = photoInput.files[0];

				this.photoBlob = null;

				const imageUrl = URL.createObjectURL(file);

				const imageElement = document.createElement("img");
				imageElement.id = "uploadedImage";
				imageElement.src = imageUrl;
				imageElement.style.width = "100%";
				imageElement.style.height = "100%";

				cameraPreview.innerHTML = "";
				cameraPreview.appendChild(imageElement);

				document.getElementById("startCameraBtn").disabled = false;
				document.getElementById("takePictureBtn").style.display = "inline-block";
				document.getElementById("takePictureBtn").disabled = true;
				document.getElementById("retakePictureBtn").style.display = "none";

				this.stopCameraStream();
			}
		});

		addStoryForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const description = document.getElementById("description").value;
			let photo = null;

			if (this.photoBlob) {
				photo = this.photoBlob;
			} else if (photoInput.files.length > 0) {
				photo = photoInput.files[0];
			} else {
				this.showErrorMessage("Silakan ambil foto dengan kamera atau unggah foto.");
				return;
			}

			this.presenter.addStory(description, photo, this.selectedLocation);
		});
	}

	showLoading() {
		document.getElementById("loadingContainer").style.display = "flex";
		document.getElementById("submitButton").disabled = true;
	}

	hideLoading() {
		document.getElementById("loadingContainer").style.display = "none";
		document.getElementById("submitButton").disabled = false;
	}

	showSuccessMessage(message) {
		document.getElementById("alertContainer").innerHTML = `
      <div class="alert alert-success">
        ${message}
      </div>
    `;
	}

	showErrorMessage(message) {
		document.getElementById("alertContainer").innerHTML = `
      <div class="alert alert-error">
        ${message}
      </div>
    `;
	}

	showOfflineWarning() {
		const warningElement = document.createElement("div");
		warningElement.id = "offlineWarning";
		warningElement.className = "alert alert-error";
		warningElement.style.position = "fixed";
		warningElement.style.top = "80px";
		warningElement.style.right = "20px";
		warningElement.style.zIndex = "9999";
		warningElement.innerHTML = `
      <p>Anda sedang offline. Beberapa fitur mungkin tidak berfungsi.</p>
    `;

		if (!document.getElementById("offlineWarning")) {
			document.body.appendChild(warningElement);

			setTimeout(() => {
				warningElement.style.opacity = "0.7";
			}, 3000);
		}
	}
}

export default AddStoryView;
