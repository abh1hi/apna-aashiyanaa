<template>
  <div class="min-h-screen flex items-center justify-center bg-green-50">
    <div class="max-w-xl w-full px-4 py-8 bg-white rounded-lg shadow-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <h1 class="mt-6 text-2xl font-bold text-green-800">Property Listed Successfully!</h1>
      <p class="mt-2 text-lg text-gray-700">Your property has been created.</p>
      <div v-if="propertyId">
        <p class="my-4">View your property here:</p>
        <router-link class="text-blue-600 hover:underline font-medium" :to="`/property/${propertyId}`">
          Go to Property Details
        </router-link>
      </div>
      <div v-else class="my-2">
        <p class="text-sm text-gray-500">No property ID found in route params.</p>
      </div>
      <div class="mt-6">
        <router-link class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold" to="/property">Back To Listings</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertySuccess',
  computed: {
    propertyId() {
      return this.$route.params.id;
    }
  }
};
</script>
