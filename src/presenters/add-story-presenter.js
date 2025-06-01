class AddStoryPresenter {
  constructor(view, apiModel, authModel) {
    this.view = view
    this.apiModel = apiModel
    this.authModel = authModel
    this.isLoading = false
  }

  async addStory(description, photo, location = null) {
    if (this.isLoading) return

    try {
      this.isLoading = true
      this.view.showLoading()

      const token = this.authModel.getToken()

      let lat = null
      let lon = null

      if (location) {
        lat = location.lat
        lon = location.lon
      }

      const response = await this.apiModel.addStory(description, photo, lat, lon, token)
      this.view.showSuccessMessage(`${response.message}! Mengarahkan ke halaman cerita...`)

      setTimeout(() => {
        window.location.hash = "#/stories"
      }, 1500)
    } catch (error) {
      this.view.showErrorMessage(error.message)
      this.isLoading = false
      this.view.hideLoading()
    }
  }
}

export default AddStoryPresenter
