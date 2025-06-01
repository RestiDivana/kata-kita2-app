class CameraComponent {
  constructor(previewElementId, options = {}) {
    this.previewElementId = previewElementId
    this.options = {
      facingMode: options.facingMode || "environment",
      ...options,
    }
    this.stream = null
    this.videoElement = null
    this.photoBlob = null
  }

  async start() {
    try {
      
      const previewElement = document.getElementById(this.previewElementId)

      if (!previewElement) {
        throw new Error(`Preview element with ID "${this.previewElementId}" not found`)
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.options.facingMode },
      })

      this.videoElement = document.createElement("video")
      this.videoElement.srcObject = this.stream
      this.videoElement.autoplay = true
      this.videoElement.style.width = "100%"
      this.videoElement.style.height = "100%"

      
      previewElement.innerHTML = ""
      previewElement.appendChild(this.videoElement)

      return true
    } catch (error) {
      console.error("Error starting camera:", error)
      throw error
    }
  }

  takePicture() {
    if (!this.videoElement || !this.stream) {
      throw new Error("Camera not started")
    }

    
    const canvas = document.createElement("canvas")
    canvas.width = this.videoElement.videoWidth
    canvas.height = this.videoElement.videoHeight

    
    const context = canvas.getContext("2d")
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height)

    
    const imageDataUrl = canvas.toDataURL("image/jpeg")

    
    canvas.toBlob(
      (blob) => {
        this.photoBlob = blob
      },
      "image/jpeg",
      0.8,
    )

    
    this.stop()

    return imageDataUrl
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  getPhotoBlob() {
    return this.photoBlob
  }
}

export default CameraComponent

