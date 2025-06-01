import CONFIG from "../config/config.js";

class ApiModel {
	async register(name, email, password) {
		try {
			const response = await fetch(`${CONFIG.BASE_URL}/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, email, password }),
			});

			const responseJson = await response.json();

			if (responseJson.error) {
				throw new Error(responseJson.message);
			}

			return responseJson;
		} catch (error) {
			throw error;
		}
	}

	async login(email, password) {
		try {
			const response = await fetch(`${CONFIG.BASE_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const responseJson = await response.json();

			if (responseJson.error) {
				throw new Error(responseJson.message);
			}

			return responseJson;
		} catch (error) {
			throw error;
		}
	}

	async getStories(token, page = 1, size = CONFIG.DEFAULT_PAGE_SIZE, location = 0) {
		try {
			const url = new URL(`${CONFIG.BASE_URL}/stories`);
			url.searchParams.append("page", page);
			url.searchParams.append("size", size);
			url.searchParams.append("location", location);

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const responseJson = await response.json();

			if (responseJson.error) {
				throw new Error(responseJson.message);
			}

			return responseJson;
		} catch (error) {
			throw error;
		}
	}

	async getStoryDetail(id, token) {
		try {
			const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const responseJson = await response.json();

			if (responseJson.error) {
				throw new Error(responseJson.message);
			}

			return responseJson;
		} catch (error) {
			throw error;
		}
	}

	async addStory(description, photo, lat = null, lon = null, token = null) {
		try {
			const formData = new FormData();
			formData.append("description", description);
			formData.append("photo", photo);

			if (lat !== null && lon !== null) {
				formData.append("lat", lat);
				formData.append("lon", lon);
			}

			const url = token ? `${CONFIG.BASE_URL}/stories` : `${CONFIG.BASE_URL}/stories/guest`;
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: formData,
			});

			const responseJson = await response.json();

			if (responseJson.error) {
				throw new Error(responseJson.message);
			}

			return responseJson;
		} catch (error) {
			throw error;
		}
	}
}

export default ApiModel;
