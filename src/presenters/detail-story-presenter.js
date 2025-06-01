import StorageModel from "../models/storage-model.js";

class DetailStoryPresenter {
	constructor(view, apiModel, authModel, storyId) {
		this.view = view;
		this.apiModel = apiModel;
		this.authModel = authModel;
		this.storyId = storyId;
		this.story = null;
		this.storageModel = new StorageModel();
	}

	async loadStoryDetail() {
		try {
			this.view.showLoading();

			let story = await this.storageModel.getStoryById(this.storyId);

			if (!story || navigator.onLine) {
				try {
					const token = this.authModel.getToken();
					const response = await this.apiModel.getStoryDetail(this.storyId, token);
					story = response.story;

					await this.storageModel.saveStories([story]);
				} catch (error) {
					if (!story) throw error;
				}
			}

			this.story = story;

			const isFavorite = await this.storageModel.isFavorite(this.storyId);
			this.view.renderStoryDetail(this.story, isFavorite);

			if (this.story.lat && this.story.lon) {
				this.view.initMap(this.story.lat, this.story.lon, this.story.name, this.story.description);
			}
		} catch (error) {
			this.view.showErrorMessage(error.message);
		}
	}

	async toggleFavorite() {
		const isFavorite = await this.storageModel.isFavorite(this.storyId);

		if (isFavorite) {
			await this.storageModel.removeFavoriteStory(this.storyId);
			return false;
		} else {
			if (this.story) {
				await this.storageModel.saveFavoriteStory(this.story);
				return true;
			}
			return false;
		}
	}
}

export default DetailStoryPresenter;
