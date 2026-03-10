/**
 * Media Uploader - Handles image and video uploads to Supabase Storage
 */

class MediaUploader {
  constructor(options = {}) {
    this.supabaseUrl = options.supabaseUrl || null;
    this.supabaseKey = options.supabaseKey || null;
    this.bucket = options.bucket || 'guide-media';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.allowedVideoTypes = ['video/mp4', 'video/webm'];
  }

  /**
   * Upload image file
   */
  async uploadImage(file, guideId = null) {
    if (!this.validateFile(file, this.allowedImageTypes)) {
      throw new Error('Invalid image file');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase not configured, using local storage');
      return this.createLocalFileUrl(file);
    }

    try {
      const fileName = this.generateFileName(file);
      const filePath = guideId ? `guides/${guideId}/${fileName}` : `images/${fileName}`;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'x-upsert': 'true'
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Return public URL
      return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${filePath}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload video file
   */
  async uploadVideo(file, guideId = null) {
    if (!this.validateFile(file, this.allowedVideoTypes)) {
      throw new Error('Invalid video file');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase not configured, using local storage');
      return this.createLocalFileUrl(file);
    }

    try {
      const fileName = this.generateFileName(file);
      const filePath = guideId ? `guides/${guideId}/videos/${fileName}` : `videos/${fileName}`;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'x-upsert': 'true'
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${filePath}`;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Delete media file
   */
  async deleteMedia(filePath) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase not configured, cannot delete');
      return false;
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${filePath}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }

  /**
   * Validate file type
   */
  validateFile(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  /**
   * Generate unique file name
   */
  generateFileName(file) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = file.name.split('.').pop();
    return `${timestamp}_${random}.${ext}`;
  }

  /**
   * Create local file URL (fallback when Supabase not available)
   */
  createLocalFileUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Create file input element
   */
  createFileInput(accept = 'image/*', multiple = false) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    return input;
  }

  /**
   * Handle file drop
   */
  setupDropZone(element, callback) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        callback(files[0]);
      }
    });
  }

  /**
   * Compress image before upload
   */
  async compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', quality);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaUploader;
}
