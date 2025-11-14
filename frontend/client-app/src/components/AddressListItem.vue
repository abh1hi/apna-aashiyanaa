<template>
  <div 
    @click="$emit('select')" 
    class="p-6 bg-surface rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg"
    :class="{ 
      'ring-2 ring-primary shadow-xl': selected, 
      'hover:bg-gray-50': !selected 
    }"
  >
    <div class="flex justify-between items-start">
      <div class="flex-grow">
        <p class="font-bold text-lg text-on-surface mb-1">{{ address.fullName }}</p>
        <p class="text-base text-secondary">{{ address.streetAddress }}</p>
        <p class="text-base text-secondary">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
      </div>
      <div v-if="address.isDefault" 
           class="ml-4 flex-shrink-0 bg-primary bg-opacity-10 text-primary text-xs font-bold px-3 py-1 rounded-full">
        DEFAULT
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  address: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select']);
</script>
