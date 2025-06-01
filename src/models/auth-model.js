import CONFIG from "../config/config.js";

class AuthModel {
	constructor() {
		this.token = localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN) || null;
		this.userId = localStorage.getItem(CONFIG.STORAGE_KEY.USER_ID) || null;
		this.name = localStorage.getItem(CONFIG.STORAGE_KEY.NAME) || null;
	}

	setAuth(loginResult) {
		const { userId, name, token } = loginResult;

		localStorage.setItem(CONFIG.STORAGE_KEY.TOKEN, token);
		localStorage.setItem(CONFIG.STORAGE_KEY.USER_ID, userId);
		localStorage.setItem(CONFIG.STORAGE_KEY.NAME, name);

		this.token = token;
		this.userId = userId;
		this.name = name;

		this._dispatchAuthChangedEvent();
	}

	logout() {
		localStorage.removeItem(CONFIG.STORAGE_KEY.TOKEN);
		localStorage.removeItem(CONFIG.STORAGE_KEY.USER_ID);
		localStorage.removeItem(CONFIG.STORAGE_KEY.NAME);

		this.token = null;
		this.userId = null;
		this.name = null;

		this._dispatchAuthChangedEvent();

		window.location.hash = "#/login";
	}

	isLoggedIn() {
		const token = localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN);
		return !!token;
	}

	getToken() {
		return localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN);
	}

	getUserId() {
		return localStorage.getItem(CONFIG.STORAGE_KEY.USER_ID);
	}

	getUserName() {
		return localStorage.getItem(CONFIG.STORAGE_KEY.NAME);
	}

	checkAuth() {
		const token = localStorage.getItem(CONFIG.STORAGE_KEY.TOKEN);
		const userId = localStorage.getItem(CONFIG.STORAGE_KEY.USER_ID);
		const name = localStorage.getItem(CONFIG.STORAGE_KEY.NAME);

		if (token && userId && name) {
			this.token = token;
			this.userId = userId;
			this.name = name;
			return true;
		}

		return false;
	}

	_dispatchAuthChangedEvent() {
		const event = new Event("auth-changed");
		window.dispatchEvent(event);
	}
}

export default AuthModel;
