<template>
  <div class="relative">
    <button @click="toggleDropdown" class="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-gray-300 rounded-xl focus:ring-primary focus:border-primary">
      <span class="text-secondary">{{ selectedLabel }}</span>
      <svg class="w-5 h-5 text-gray-400 transform transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200">
        <ul>
          <li v-for="option in options" :key="option.value" @click="selectOption(option)" class="px-4 py-3 text-secondary hover:bg-gray-100 cursor-pointer">
            {{ option.label }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => option.value === props.modelValue);
  return selectedOption ? selectedOption.label : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
