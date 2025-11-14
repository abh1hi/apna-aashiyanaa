<template>
  <div class="bg-surface rounded-2xl p-6 shadow-lg relative transition-all hover:shadow-xl"
       :class="{ 'ring-2 ring-primary': address.isDefault }">
    <div v-if="address.isDefault" class="absolute top-4 right-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">DEFAULT</div>
    <div class="flex flex-col h-full">
      <div class="flex-grow mb-4">
        <p class="font-bold text-lg text-on-surface mb-1">{{ address.fullName }}</p>
        <p class="text-secondary">{{ address.streetAddress }}</p>
        <p v-if="address.apartment" class="text-secondary">{{ address.apartment }}</p>
        <p class="text-secondary">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
        <p class="text-secondary">{{ address.country }}</p>
        <p class="mt-2 font-medium text-secondary">{{ address.phoneNumber }}</p>
      </div>
      <div class="flex items-center justify-end space-x-4 mt-4">
        <button @click="$emit('edit', address)" class="font-medium text-primary hover:text-blue-700">Edit</button>
        <button @click="$emit('delete', address._id)" class="font-medium text-red-500 hover:text-red-700">Delete</button>
        <button v-if="!address.isDefault" @click="$emit('setDefault', address._id)"
                class="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Set as Default
        </button>
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
});

defineEmits(['edit', 'delete', 'setDefault']);
</script>