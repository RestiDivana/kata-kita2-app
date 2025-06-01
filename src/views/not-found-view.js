class NotFoundView {
	constructor() {
		this.container = null;
	}

	render(container) {
		this.container = container;

		container.innerHTML = `
      <section class="not-found" style="text-align: center; padding: 4rem 2rem;">
        <div class="card" style="
          background-color: var(--blue-macaron); 
          color: var(--blue-dark); 
          max-width: 600px; 
          margin: 0 auto;
          padding: 2.5rem 2rem;
          border-radius: 14px;
          box-shadow: 0 8px 20px rgba(163, 206, 241, 0.4);">
          
          <h2 class="card-title" style="font-size: 3rem; margin-bottom: 0.8rem; color: var(--pink-dark);">
            404
          </h2>
          <h3 style="font-size: 2rem; margin-bottom: 1.6rem;">
            Halaman Tidak Ditemukan
          </h3>
          <p class="card-content" style="font-size: 1.1rem; margin-bottom: 2rem; line-height: 1.6;">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan. 
            Pastikan URL yang Anda masukkan sudah benar.
          </p>
          
          <div class="not-found-actions">
            <a href="#/" class="btn" style="margin-right: 0.8rem;">
              Kembali ke Beranda
            </a>
            <a href="#/stories" class="btn btn-secondary">
              Jelajahi Cerita
            </a>
          </div>
        </div>
      </section>
    `;
	}

	afterRender() {
		// Tidak perlu aksi lanjutan untuk halaman 404
	}
}

export default NotFoundView;
