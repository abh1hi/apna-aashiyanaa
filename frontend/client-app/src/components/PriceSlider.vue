<template>
  <div class="w-full px-2">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-secondary">Price Range</span>
      <div class="text-sm font-semibold text-on-surface bg-surface-variant px-3 py-1 rounded-lg">
        ${{ modelValue.min.toLocaleString() }} - ${{ modelValue.max.toLocaleString() }}
      </div>
    </div>
    <div ref="slider" class="relative h-12 flex items-center select-none">
      <!-- Track -->
      <div class="absolute bg-gray-200 h-1.5 w-full rounded-full"></div>
      <!-- Range -->
      <div class="absolute bg-primary h-1.5 rounded-full" :style="rangeStyle"></div>

      <!-- Min Thumb -->
      <div 
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        :style="{ left: minThumbLeft + 'px' }"
        @mousedown="e => startDrag(e, 'min')"
        @touchstart="e => startDrag(e, 'min')"
      >
        <div class="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-primary cursor-pointer ring-4 ring-transparent active:ring-primary/20 transition-shadow"></div>
      </div>

      <!-- Max Thumb -->
      <div 
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        :style="{ left: maxThumbLeft + 'px' }"
        @mousedown="e => startDrag(e, 'max')"
        @touchstart="e => startDrag(e, 'max')"
      >
        <div class="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-primary cursor-pointer ring-4 ring-transparent active:ring-primary/20 transition-shadow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1000000 },
  step: { type: Number, default: 1000 },
  modelValue: { type: Object, default: () => ({ min: 200000, max: 800000 }) },
});

const emit = defineEmits(['update:modelValue']);

const slider = ref(null);
const sliderWidth = ref(0);
const sliderLeft = ref(0);
const activeThumb = ref(null);

const valueToPixel = (value) => {
  const val = Math.max(props.min, Math.min(props.max, value));
  const percent = (val - props.min) / (props.max - props.min);
  return percent * sliderWidth.value;
};

const pixelToValue = (pixel) => {
  const percent = Math.max(0, Math.min(1, pixel / sliderWidth.value));
  const value = props.min + percent * (props.max - props.min);
  return Math.round(value / props.step) * props.step;
};

const minThumbLeft = computed(() => valueToPixel(props.modelValue.min));
const maxThumbLeft = computed(() => valueToPixel(props.modelValue.max));

const rangeStyle = computed(() => ({
  left: `${minThumbLeft.value}px`,
  width: `${maxThumbLeft.value - minThumbLeft.value}px`,
}));

const startDrag = (e, thumb) => {
  e.preventDefault();
  activeThumb.value = thumb;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
  if (activeThumb.value === null) return;
  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  const pixel = clientX - sliderLeft.value;
  const newValue = pixelToValue(pixel);

  let { min: currentMin, max: currentMax } = props.modelValue;

  if (activeThumb.value === 'min') {
    currentMin = Math.min(newValue, currentMax - props.step);
  } else {
    currentMax = Math.max(newValue, currentMin + props.step);
  }
  
  emit('update:modelValue', { min: currentMin, max: currentMax });
};

const stopDrag = () => {
  activeThumb.value = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);
};

const updateSliderDimensions = () => {
  if (slider.value) {
    const rect = slider.value.getBoundingClientRect();
    sliderWidth.value = rect.width;
    sliderLeft.value = rect.left;
  }
};

onMounted(() => {
  updateSliderDimensions();
  window.addEventListener('resize', updateSliderDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSliderDimensions);
});

</script>