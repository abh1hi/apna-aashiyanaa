<template>
  <div class="relative w-full aspect-video max-h-[400px] rounded-2xl overflow-hidden shadow-lg">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :options="{ zoomControl: false }"
      @move="handleMove"
      @moveend="handleMoveEnd"
    >
      <l-tile-layer
        :url="tileLayerUrl"
        :attribution="attribution"
      ></l-tile-layer>
    </l-map>

    <!-- Map Crosshair -->
    <div class="absolute-center pointer-events-none">
      <svg class="w-10 h-10 text-primary animate-pulse" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8m-4-4h8"></path>
      </svg>
    </div>

    <!-- Map Controls -->
    <div class="absolute top-3 right-3 flex flex-col space-y-3">
      <button @click="zoomIn" class="map-control-button">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"></path></svg>
      </button>
      <button @click="zoomOut" class="map-control-button">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>
      </button>
      <button @click="getUserLocation" class="map-control-button">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </button>
    </div>

    <div class="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md">
       <p class="text-xs text-gray-600">Drag the map to pinpoint your location.</p>
       <p v-if="permissionStatus" class="text-xs text-gray-500 mt-1">Location permission: <span :class="permissionClass">{{ permissionStatus }}</span></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ latitude: 51.505, longitude: -0.09 }) }
});
const emit = defineEmits(['update:modelValue']);

const map = ref(null);
const zoom = ref(14);
const center = ref([props.modelValue.latitude, props.modelValue.longitude]);

// Using Stadia Maps for a more modern look. An API key is not required for development.
const tileLayerUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const attribution = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

const permissionStatus = ref('');
const permissionClass = ref('');

const handleMove = () => {
  if (!map.value) return;
  const newCenter = map.value.leafletObject.getCenter();
  emit('update:modelValue', { latitude: newCenter.lat, longitude: newCenter.lng });
};

const zoomIn = () => map.value.leafletObject.zoomIn();
const zoomOut = () => map.value.leafletObject.zoomOut();

const checkPermissions = async () => {
  try {
    const permissions = await navigator.permissions.query({ name: 'geolocation' });
    permissionStatus.value = permissions.state;
    permissionClass.value = permissions.state === 'granted' ? 'text-green-600' : 'text-orange-500';
    return permissions.state;
  } catch (e) {
    permissionStatus.value = 'unavailable';
    permissionClass.value = 'text-red-500';
    return 'prompt';
  }
};

const getUserLocation = async () => {
  const state = await checkPermissions();
  if (state === 'denied') {
    alert('Location access is denied. Please enable it in your browser settings.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      center.value = [latitude, longitude];
      map.value.leafletObject.setView(center.value, 16);
      handleMove(); // Update parent model
      checkPermissions();
    },
    (error) => {
      alert(`Error: ${error.message}`);
      checkPermissions();
    }
  );
};

watch(() => props.modelValue, (newVal) => {
  const currentCenter = map.value.leafletObject.getCenter();
  if (newVal.latitude !== currentCenter.lat || newVal.longitude !== currentCenter.lng) {
    center.value = [newVal.latitude, newVal.longitude];
  }
}, { deep: true });

onMounted(checkPermissions);

</script>

<style scoped>
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.map-control-button {
  @apply w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 shadow-md hover:bg-white transition-all;
}
</style>