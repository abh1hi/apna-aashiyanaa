<template>
  <div class="add-property-page min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-gray-900">List Your Property</h1>
        <p class="text-gray-600 mt-2">Follow the steps to get your property listed on our platform.</p>
      </div>

      <!-- Stepper -->
      <div class="mb-8 p-2 bg-white rounded-full shadow-md flex items-center justify-between">
        <div v-for="(step, index) in steps" :key="index" class="flex-1 text-center cursor-pointer" @click="currentStep = index">
          <div 
            :class="[
              'py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300',
              currentStep === index ? 'bg-blue-600 text-white shadow-lg' : 
              currentStep > index ? 'text-blue-600' : 'text-gray-500'
            ]"
          >
            <i :class="[step.icon, currentStep === index ? 'mr-2' : 'hidden md:inline-block mr-2']"></i>
            <span :class="{'hidden md:inline': currentStep !== index}">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <form @submit.prevent="handleSubmit">
          <div class="min-h-[400px]">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ steps[currentStep].title }}</h2>
            <p class="text-gray-600 mb-6">{{ steps[currentStep].fullDescription }}</p>

            <!-- Step 1: Basic Info -->
            <div v-show="currentStep === 0" class="space-y-6">
              <div class="form-group">
                  <label>Property Title *</label>
                  <input v-model="formData.title" type="text" required placeholder="e.g., Modern 2BHK with City View"/>
              </div>
              <div class="form-group">
                  <label>Description *</label>
                  <textarea v-model="formData.description" required rows="5" placeholder="Tell us what makes your property special..."></textarea>
              </div>
                <div class="form-group">
                  <label>Listing Type *</label>
                  <div class="grid grid-cols-2 gap-4">
                      <button type="button" @click="formData.listingType = 'sale'" :class="{'active': formData.listingType === 'sale'}" class="option-button">
                          <i class="fas fa-tag"></i> For Sale
                      </button>
                        <button type="button" @click="formData.listingType = 'rent'" :class="{'active': formData.listingType === 'rent'}" class="option-button">
                          <i class="fas fa-key"></i> For Rent
                      </button>
                  </div>
              </div>
            </div>

            <!-- Step 2: Details -->
            <div v-show="currentStep === 1" class="space-y-6">
                <div class="form-group">
                  <label>Property Type *</label>
                  <select v-model="formData.propertyType" required>
                      <option disabled value="">Select a property type</option>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Villa</option>
                      <option>Land</option>
                      <option>Commercial</option>
                  </select>
              </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-group">
                      <label>Bedrooms *</label>
                      <input v-model.number="formData.bedrooms" type="number" min="0" required placeholder="e.g., 3"/>
                  </div>
                  <div class="form-group">
                      <label>Bathrooms *</label>
                      <input v-model.number="formData.bathrooms" type="number" min="0" required placeholder="e.g., 2"/>
                  </div>
              </div>
              <div class="form-group">
                  <label>Total Area (sq ft) *</label>
                  <input v-model.number="formData.area" type="number" min="0" required placeholder="e.g., 1200"/>
              </div>
            </div>

            <!-- Step 3: Location -->
            <div v-show="currentStep === 2" class="space-y-6">
                <div class="form-group">
                  <label>Address / Street *</label>
                  <input v-model="formData.location.address" required placeholder="e.g., 123 Sunshine Avenue"/>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-group">
                    <label>City *</label>
                    <input v-model="formData.location.city" required placeholder="e.g., Mumbai"/>
                </div>
                <div class="form-group">
                    <label>State *</label>
                    <input v-model="formData.location.state" required placeholder="e.g., Maharashtra"/>
                </div>
              </div>
                <div class="form-group">
                  <label>Pincode *</label>
                  <input v-model="formData.location.pincode" required placeholder="e.g., 400001"/>
              </div>
            </div>

            <!-- Step 4: Pricing -->
              <div v-show="currentStep === 3" class="space-y-6">
                  <div class="form-group">
                      <label>Expected Price (&#8377;) *</label>
                      <input v-model.number="formData.price" type="number" min="0" required placeholder="e.g., 7500000"/>
                  </div>
              </div>

            <!-- Step 5: Amenities -->
            <div v-show="currentStep === 4">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label v-for="amenity in availableAmenities" :key="amenity" class="amenity-label" :class="{'active': formData.amenities.includes(amenity)}">
                  <input type="checkbox" :value="amenity" v-model="formData.amenities" class="hidden"/>
                  <i class="fas fa-check-circle mr-2"></i>
                  <span class="text-sm font-medium">{{ amenity }}</span>
                </label>
              </div>
            </div>

            <!-- Step 6: Images -->
            <div v-show="currentStep === 5">
              <PropertyImageUpload @images-selected="handleImagesSelected" :max-images="10"/>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center mt-10 border-t border-gray-200 pt-6">
            <button type="button" @click="previousStep" :disabled="currentStep === 0" class="btn-secondary" :class="{'opacity-50 cursor-not-allowed': currentStep === 0}">
              <i class="fas fa-arrow-left mr-2"></i> Previous
            </button>

            <button v-if="currentStep < steps.length - 1" type="button" @click="nextStep" class="btn-primary">
              Next <i class="fas fa-arrow-right ml-2"></i>
            </button>
            <button v-else type="submit" :disabled="isSubmitting" class="btn-primary bg-green-600 hover:bg-green-700">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isSubmitting ? 'Submitting...' : 'Submit Property' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PropertyImageUpload from '../../components/PropertyImageUpload.vue';

const router = useRouter();
const currentStep = ref(0);

const steps = [
  { title: 'Basics', icon: 'fas fa-info-circle', fullDescription: 'Let\'s start with the property title and description.' },
  { title: 'Details', icon: 'fas fa-ruler-combined', fullDescription: 'Provide key details like size and number of rooms.' },
  { title: 'Location', icon: 'fas fa-map-marker-alt', fullDescription: 'Where is your property located?' },
  { title: 'Pricing', icon: 'fas fa-rupee-sign', fullDescription: 'How much do you want to list it for?' },
  { title: 'Amenities', icon: 'fas fa-star', fullDescription: 'Select all the amenities available.' },
  { title: 'Images', icon: 'fas fa-images', fullDescription: 'Upload high-quality images of your property.' }
];

const formData = ref({ title: '', description: '', listingType: 'sale', propertyType: '', bedrooms: null, bathrooms: null, area: null, price: null, location: { address: '', city: '', state: '', pincode: '' }, amenities: [] });
const selectedImages = ref([]);
const availableAmenities = [ 'Parking', 'Garden', 'Pool', 'Gym', 'Security', 'Backup', 'Lift', 'Clubhouse', 'Play Area', 'WiFi' ];
const isSubmitting = ref(false);

const nextStep = () => { if (currentStep.value < steps.length - 1) currentStep.value++; };
const previousStep = () => { if (currentStep.value > 0) currentStep.value--; };

const handleImagesSelected = (images) => { selectedImages.value = images; };

const handleSubmit = async () => {
  isSubmitting.value = true;
  console.log('Submitting:', formData.value, selectedImages.value);
  setTimeout(() => {
    isSubmitting.value = false;
    router.push({ name: 'PropertySuccess', params: { id: 'new-property-123' } });
  }, 2000);
};

</script>

<style scoped>
.form-group label { @apply block text-sm font-bold text-gray-700 mb-2; }
.form-group input, .form-group textarea, .form-group select { @apply w-full bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400; @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white; }
.option-button { @apply w-full p-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold flex items-center justify-center; @apply transition-all duration-200; }
.option-button.active { @apply bg-blue-50 border-blue-500 text-blue-600; }
.amenity-label { @apply flex items-center p-3 rounded-lg border-2 border-gray-300 bg-white cursor-pointer; @apply transition-all duration-200; }
.amenity-label.active { @apply bg-blue-50 border-blue-500 text-blue-600; }

.btn-primary { @apply bg-blue-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg; }
.btn-secondary { @apply bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gray-300; }
</style>