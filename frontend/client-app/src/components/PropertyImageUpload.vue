<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div 
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      ]"
      @click="$refs.fileInput.click()"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-lg font-medium text-gray-700">Drop images here or click to upload</p>
        <p class="text-sm text-gray-500">Maximum {{ maxImages }} images, up to 10MB each</p>
        <p class="text-xs text-gray-400">Images over 2MB will be automatically compressed</p>
      </div>
      <input 
        ref="fileInput"
        type="file" 
        multiple 
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>

    <!-- Image Previews -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="relative group"
      >
        <img 
          :src="image.preview" 
          :alt="`Property image ${index + 1}`"
          class="w-full h-32 object-cover rounded-lg"
        />
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
          <button 
            type="button"
            @click="removeImage(index)"
            class="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-1 text-xs text-gray-500 text-center">
          {{ formatFileSize(image.file.size) }}
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span>Uploading images...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyImageUpload',
  props: {
    maxImages: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      images: [],
      isDragging: false,
      isUploading: false,
      uploadProgress: 0,
      errorMessage: ''
    };
  },
  methods: {
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
    },
    handleDrop(event) {
      this.isDragging = false;
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    },
    processFiles(files) {
      this.errorMessage = '';
      
      // Filter only image files
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        this.errorMessage = 'Please select valid image files';
        return;
      }
      
      // Check total count
      if (this.images.length + imageFiles.length > this.maxImages) {
        this.errorMessage = `Maximum ${this.maxImages} images allowed`;
        return;
      }
      
      // Check individual file sizes
      const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        this.errorMessage = 'Some files exceed 10MB limit';
        return;
      }
      
      // Create previews
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({
            file: file,
            preview: e.target.result
          });
          this.emitImages();
        };
        reader.readAsDataURL(file);
      });
    },
    removeImage(index) {
      this.images.splice(index, 1);
      this.emitImages();
    },
    emitImages() {
      const files = this.images.map(img => img.file);
      this.$emit('images-selected', files);
    },
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
};
</script>
