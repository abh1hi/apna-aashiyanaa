<template>
  <div class="property-image-uploader border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
    <input type="file" ref="fileInput" multiple @change="handleFileSelect" class="hidden" accept="image/*">
    
    <div v-if="images.length === 0" class="flex flex-col items-center justify-center h-full">
      <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
      <p class="text-gray-600 font-semibold">Click or Drag & Drop Images</p>
      <p class="text-sm text-gray-500 mt-1">Supports JPG, PNG. Max {{ maxImages }} images.</p>
    </div>

    <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      <div v-for="(image, index) in images" :key="index" class="relative group aspect-w-1 aspect-h-1">
        <img :src="image.url" class="w-full h-full object-cover rounded-md shadow-md">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button @click.stop="removeImage(index)" class="text-white text-2xl hover:text-red-500">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <div v-if="images.length < maxImages" @click.stop="triggerFileInput" class="add-more-tile flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500">
        <i class="fas fa-plus text-2xl text-gray-400"></i>
      </div>
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
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  processFiles(event.target.files);
};

const handleDrop = (event) => {
  processFiles(event.dataTransfer.files);
};

const processFiles = (files) => {
  if (!files) return;
  
  for (let i = 0; i < files.length; i++) {
    if (images.value.length >= props.maxImages) break;
    const file = files[i];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value.push({ file: file, url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }
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
