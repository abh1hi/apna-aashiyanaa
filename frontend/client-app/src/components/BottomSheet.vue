<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" @click.self="closeSheet" class="fixed inset-0 bg-black bg-opacity-60 z-40"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="isOpen" class="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col p-4" ref="sheetContent">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" @mousedown="startDrag"></div>
        <div class="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 class="text-xl font-bold text-on-surface">{{ title }}</h3>
          <button @click="closeSheet" class="text-gray-500 hover:text-gray-800 p-2 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-grow">
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ isOpen: Boolean, title: String });
const emit = defineEmits(['close']);

const sheetContent = ref(null);
const startY = ref(0);
const currentY = ref(0);
const isDragging = ref(false);

const closeSheet = () => emit('close');

const startDrag = (event) => {
  isDragging.value = true;
  startY.value = event.clientY;
  sheetContent.value.style.transition = 'none';
};

const onDrag = (event) => {
  if (!isDragging.value) return;
  currentY.value = event.clientY;
  const deltaY = currentY.value - startY.value;
  if (deltaY > 0) {
    sheetContent.value.style.transform = `translateY(${deltaY}px)`;
  }
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  sheetContent.value.style.transition = 'transform 0.3s ease-out';
  const deltaY = currentY.value - startY.value;
  if (deltaY > 100) {
    closeSheet();
  } else {
    sheetContent.value.style.transform = 'translateY(0)';
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
  } else {
    document.body.style.overflow = 'auto';
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
  }
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>