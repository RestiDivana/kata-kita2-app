class LoginHandler {
  constructor(view, apiModel, authModel) {
		this.view = view;
		this.apiModel = apiModel;
		this.authModel = authModel;
		this.isLoading = false;
	}

  async login(email, password) {
		if (this.isLoading) return;

		try {
			this.isLoading = true;
			this.view.showLoading();

			const response = await this.apiModel.login(email, password);
			this.authModel.setAuth(response.loginResult);
			this.view.showSuccessMessage("Login berhasil! Mengarahkan...");

			setTimeout(() => {
				window.location.hash = "#/stories";

				setTimeout(() => {
					window.location.reload();
				}, 100);
			}, 1000);
		} catch (error) {
			this.view.showErrorMessage(error.message);
			this.isLoading = false;
			this.view.hideLoading();
		}
	}
}

export default LoginHandler;
