import LoginHandler from "../presenters/login-presenter.js";
import ApiModel from "../models/api-model.js";
import AuthModel from "../models/auth-model.js";

class LoginView {
  constructor() {
    this.container = null;
    this.apiModel = new ApiModel();
    this.authModel = new AuthModel();
    this.presenter = new LoginHandler(this, this.apiModel, this.authModel);
  }

  render(container) {
    this.container = container;

    container.innerHTML = `
      <section class="form-container">
        <h2 class="form-title">Masuk</h2>
        <div id="alertContainer"></div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <div id="loadingContainer" class="loading-container" style="display: none;">
            <div class="loading-spinner"></div>
          </div>
          
          <button type="submit" id="loginButton" class="btn">Masuk</button>
        </form>
        
        <p class="form-footer" style="margin-top: 1.5rem; font-weight: bold;">
          Belum punya akun? <a href="#/register" style="color: var(--dark); text-decoration: underline;">Daftar di sini</a>
        </p>
      </section>
    `;
  }

  afterRender() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Panggil presenter dengan method sesuai LoginHandler
      this.presenter.login(email, password);
		});
	}

	showLoading() {
		document.getElementById("loadingContainer").style.display = "flex";
		document.getElementById("loginButton").disabled = true;
	}

	hideLoading() {
		document.getElementById("loadingContainer").style.display = "none";
		document.getElementById("loginButton").disabled = false;
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

export default LoginView;
