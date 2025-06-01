class RegistrationHandler {
  constructor(view, apiModel) {
		this.view = view;
		this.apiModel = apiModel;
		this.isLoading = false;
	}

  async register(name, email, password) {
		if (this.isLoading) return;

		try {
			this.isLoading = true;
			this.view.showLoading();

			const response = await this.apiModel.register(name, email, password);
			this.view.showSuccessMessage(`${response.message}! Mengarahkan ke halaman login...`);

			setTimeout(() => {
				window.location.hash = "#/login";
			}, 1500);
		} catch (error) {
			this.view.showErrorMessage(error.message);
			this.isLoading = false;
			this.view.hideLoading();
		}
	}
}

export default RegistrationHandler;
