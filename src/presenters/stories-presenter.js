import CONFIG from "../config/config.js";
import StorageModel from "../models/storage-model.js";

class StoriesPresenter {
	constructor(view, apiModel, authModel) {
		this.view = view;
		this.apiModel = apiModel;
		this.authModel = authModel;
		this.stories = [];
		this.page = 1;
		this.size = CONFIG.DEFAULT_PAGE_SIZE;
		this.hasMore = true;
		this.isLoading = false;
	}

	async loadStories() {
		if (this.isLoading) return;

		try {
			this.isLoading = true;
			this.view.showLoading();

			let stories = [];

			try {
				const token = this.authModel.getToken();
				const response = await this.apiModel.getStories(token, this.page, this.size, 1);

				stories = [...this.stories, ...response.listStory];
				this.hasMore = response.listStory.length === this.size;

				const storageModel = new StorageModel();
				await storageModel.saveStories(response.listStory);
			} catch (error) {
				console.error("Error fetching from API:", error);

				if (navigator.onLine === false) {
					const storageModel = new StorageModel();
					const cachedStories = await storageModel.getStories();

					if (cachedStories.length > 0) {
						stories = cachedStories;
						this.hasMore = false;
					}
				} else {
					throw error;
				}
			}

			this.stories = stories;
			this.view.renderStories(this.stories);

			if (this.view.isMapInitialized()) {
				this.view.updateMapMarkers(this.stories);
			}

			this.isLoading = false;
			this.view.hideLoading();
			this.view.updateLoadMoreButton(this.hasMore);
		} catch (error) {
			this.view.showErrorMessage(error.message);
			this.isLoading = false;
			this.view.hideLoading();
		}
	}

	loadMoreStories() {
		this.page += 1;
		this.loadStories();
	}

	async toggleFavorite(storyId) {
		const storageModel = new StorageModel();
		const isFavorite = await storageModel.isFavorite(storyId);

		const story = this.stories.find((s) => s.id === storyId);
		if (!story) return false;

		if (isFavorite) {
			await storageModel.removeFavoriteStory(storyId);
			return false;
		} else {
			await storageModel.saveFavoriteStory(story);
			return true;
		}
	}

	async checkFavoriteStatus(storyId) {
		const storageModel = new StorageModel();
		return await storageModel.isFavorite(storyId);
	}
}

export default StoriesPresenter;
