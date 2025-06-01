class HomeView {
	constructor() {
		this.container = null;
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
      <section class="hero">
        <div class="card">
          <h2 class="card-title">Kata Kita</h2>
          <p class="card-content">Tulis kisahmu, abadikan setiap momen, tambahkan titik lokasi, dan temukan koneksi baru dengan pengguna lainnya.</p>
          <div class="hero-actions">
            <a href="#/stories" class="btn">Lihat Cerita</a>
            <a href="#/add" class="btn btn-secondary">Tulis Ceritamu</a>
          </div>
        </div>
      </section>
    `;
	}

	afterRender() {}
}

export default HomeView;
