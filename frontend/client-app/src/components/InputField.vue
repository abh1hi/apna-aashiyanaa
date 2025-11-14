<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-secondary mb-2">{{ label }}</label>
    <input :type="type" :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
           :required="required"
           class="w-full px-4 py-3 bg-gray-50 border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
           :placeholder="placeholder">
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  required: Boolean,
  placeholder: String,
});

defineEmits(['update:modelValue']);

const id = computed(() => `input-${Math.random().toString(36).substring(2, 9)}`);
</script>
