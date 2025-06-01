import RegistrationHandler from "../presenters/register-presenter.js";
import ApiModel from "../models/api-model.js";

class RegisterView {
  constructor() {
    this.container = null;
    this.apiModel = new ApiModel();
    this.presenter = new RegistrationHandler(this, this.apiModel);
  }

  render(container) {
    this.container = container;

    container.innerHTML = `
      <section class="form-container" style="background-color: var(--accent);">
        <h2 class="form-title">Daftar</h2>
        <div id="alertContainer"></div>
        
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Kata Sandi (min. 8 karakter)</label>
            <input type="password" id="password" name="password" minlength="8" required>
          </div>
          
          <div id="loadingContainer" class="loading-container" style="display: none;">
            <div class="loading-spinner"></div>
          </div>
          
          <button type="submit" id="registerButton" class="btn">Daftar</button>
        </form>
        
        <p class="form-footer" style="margin-top: 1.5rem; font-weight: bold;">
          Sudah punya akun? <a href="#/login" style="color: var(--dark); text-decoration: underline;">Masuk di sini</a>
        </p>
      </section>
    `;
  }

  afterRender() {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Sesuaikan pemanggilan method presenter sesuai register-presenter.js
      this.presenter.register(name, email, password);
		});
	}

	showLoading() {
		document.getElementById("loadingContainer").style.display = "flex";
		document.getElementById("registerButton").disabled = true;
	}

	hideLoading() {
		document.getElementById("loadingContainer").style.display = "none";
		document.getElementById("registerButton").disabled = false;
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
}

export default RegisterView;