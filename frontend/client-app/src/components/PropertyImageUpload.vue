<template>
  <div class="property-image-uploader">
    <div 
      class="dropzone bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50"
      @click="triggerFileInput" 
      @dragover.prevent 
      @drop.prevent="handleDrop"
    >
      <input type="file" ref="fileInput" multiple @change="handleFileSelect" class="hidden" accept="image/*">
      
      <div v-if="images.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <i class="fas fa-cloud-upload-alt text-5xl mb-4"></i>
        <p class="text-lg font-semibold">Drag & Drop Images Here</p>
        <p class="text-sm">or <span class="text-blue-500 font-semibold">click to browse</span></p>
        <p class="text-xs text-gray-400 mt-2">Maximum {{ maxImages }} images. PNG, JPG, GIF.</p>
      </div>

      <transition-group v-else name="list" tag="div" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        <div v-for="(image, index) in images" :key="image.url" class="relative group aspect-w-1 aspect-h-1">
          <img :src="image.url" class="w-full h-full object-cover rounded-lg shadow-md border border-gray-200">
          <div class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
            <button @click.stop="removeImage(index)" class="text-white text-3xl transform transition-transform duration-300 hover:scale-125 hover:text-red-500">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <div 
          v-if="images.length < maxImages" 
          @click.stop="triggerFileInput" 
          class="add-more-tile flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-gray-100 transition-all duration-300"
        >
          <div class="text-center text-gray-500">
            <i class="fas fa-plus text-3xl"></i>
            <p class="text-sm font-semibold mt-1">Add More</p>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue';

const props = defineProps({
  maxImages: { type: Number, default: 10 },
});

const emit = defineEmits(['images-selected']);

const fileInput = ref(null);
const images = ref([]); // Stores { file: File, url: string }

const triggerFileInput = () => {
  if (images.value.length < props.maxImages) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event) => {
  processFiles(event.target.files);
};

const handleDrop = (event) => {
  processFiles(event.dataTransfer.files);
};

const processFiles = (files) => {
  if (!files) return;
  
  const availableSlots = props.maxImages - images.value.length;
  const filesToProcess = Array.from(files).slice(0, availableSlots);

  filesToProcess.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value.push({ file: file, url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};

// Emit the updated file list whenever the images array changes
watch(images, (newImages) => {
  const fileObjects = newImages.map(img => img.file);
  emit('images-selected', fileObjects);
}, { deep: true });

</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

.add-more-tile {
  min-height: 100px; /* Ensure the tile has a minimum height */
}
</style>