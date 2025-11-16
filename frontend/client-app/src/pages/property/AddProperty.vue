<template>
  <div class="add-property-page min-h-screen bg-gray-100 font-sans">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">List Your Property</h1>
        <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Join our platform and reach thousands of potential buyers and renters.</p>
      </div>

      <!-- Stepper Navigation -->
      <div class="mb-10 p-3 bg-white rounded-full shadow-lg flex items-center justify-around border border-gray-200">
        <div v-for="(step, index) in steps" :key="index" class="flex-1 text-center cursor-pointer group" @click="currentStep = index">
          <div class="flex flex-col items-center">
            <div 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ease-in-out',
                currentStep === index ? 'bg-blue-600 text-white scale-110 shadow-blue-300 shadow-md' : 
                currentStep > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
              ]"
            >
              <i :class="step.icon"></i>
            </div>
            <p 
              :class="[
                'mt-2 text-xs md:text-sm font-semibold transition-colors duration-300',
                currentStep === index ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'
              ]"
            >
              {{ step.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div class="p-6 sm:p-8 md:p-10">
          <form @submit.prevent="handleSubmit">
            <div class="min-h-[450px]">
              <transition name="fade" mode="out-in">
                <div :key="currentStep">
                  <h2 class="text-3xl font-bold text-gray-800 mb-3">{{ steps[currentStep].title }}</h2>
                  <p class="text-gray-500 mb-8">{{ steps[currentStep].fullDescription }}</p>

                  <!-- Dynamic Step Content -->
                  <!-- Step 1: Basic Info -->
                  <div v-if="currentStep === 0" class="space-y-6">
                    <div class="form-group">
                        <label for="name">Property Name *</label>
                        <input id="name" v-model="formData.name" type="text" required placeholder="e.g., Modern 2BHK with City View"/>
                    </div>
                    <div class="form-group">
                        <label for="description">Description *</label>
                        <textarea id="description" v-model="formData.description" required rows="5" placeholder="Tell us what makes your property special..."></textarea>
                    </div>
                      <div class="form-group">
                        <label>Listing Type *</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button type="button" @click="setListingType('For Sale')" :class="{'active': formData.listingType === 'For Sale'}" class="option-button">
                                <i class="fas fa-tag mr-3"></i> For Sale
                            </button>
                              <button type="button" @click="setListingType('For Rent')" :class="{'active': formData.listingType === 'For Rent'}" class="option-button">
                                <i class="fas fa-key mr-3"></i> For Rent
                            </button>
                        </div>
                    </div>
                  </div>

                  <!-- Step 2: Details -->
                  <div v-if="currentStep === 1" class="space-y-6">
                      <div class="form-group">
                        <label for="propertyType">Property Type *</label>
                        <select id="propertyType" v-model="formData.propertyType" required>
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
                            <label for="bedrooms">Bedrooms *</label>
                            <input id="bedrooms" v-model.number="formData.specifications.bedrooms" type="number" min="0" required placeholder="e.g., 3"/>
                        </div>
                        <div class="form-group">
                            <label for="bathrooms">Bathrooms *</label>
                            <input id="bathrooms" v-model.number="formData.specifications.bathrooms" type="number" min="0" required placeholder="e.g., 2"/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="area">Total Area (sq ft) *</label>
                        <input id="area" v-model.number="formData.specifications.area" type="number" min="0" required placeholder="e.g., 1200"/>
                    </div>
                  </div>

                  <!-- Step 3: Location -->
                  <div v-if="currentStep === 2" class="space-y-6">
                      <div class="form-group">
                        <label for="address">Address / Street *</label>
                        <input id="address" v-model="formData.location.address" required placeholder="e.g., 123 Sunshine Avenue"/>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                          <label for="city">City *</label>
                          <input id="city" v-model="formData.location.city" required placeholder="e.g., Mumbai"/>
                      </div>
                      <div class="form-group">
                          <label for="state">State *</label>
                          <input id="state" v-model="formData.location.state" required placeholder="e.g., Maharashtra"/>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                          <label for="country">Country *</label>
                          <input id="country" v-model="formData.location.country" required placeholder="e.g., India"/>
                      </div>
                      <div class="form-group">
                          <label for="pincode">Pincode *</label>
                          <input id="pincode" v-model="formData.location.pincode" required placeholder="e.g., 400001"/>
                      </div>
                    </div>
                  </div>

                  <!-- Step 4: Pricing -->
                    <div v-if="currentStep === 3" class="space-y-6">
                        <div class="form-group">
                            <label for="price">Expected Price (₹) *</label>
                            <input id="price" v-model.number="formData.price" type="number" min="0" required placeholder="e.g., 7,500,000"/>
                        </div>
                    </div>

                  <!-- Step 5: Amenities -->
                  <div v-if="currentStep === 4">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <label v-for="amenity in availableAmenities" :key="amenity" class="amenity-label" :class="{'active': formData.amenities.includes(amenity)}">
                        <input type="checkbox" :value="amenity" v-model="formData.amenities" class="hidden"/>
                        <i class="fas fa-check-circle text-lg mr-2"></i>
                        <span class="text-sm font-medium">{{ amenity }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Step 6: Images -->
                  <div v-if="currentStep === 5">
                    <PropertyImageUpload @images-selected="handleImagesSelected" :max-images="10"/>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between items-center mt-12 border-t border-gray-200 pt-6">
              <button type="button" @click="previousStep" :disabled="currentStep === 0 || isSubmitting" class="btn-secondary" :class="{'opacity-50 cursor-not-allowed': currentStep === 0 || isSubmitting}">
                <i class="fas fa-arrow-left mr-2"></i> Previous
              </button>

              <button v-if="currentStep < steps.length - 1" type="button" @click="nextStep" class="btn-primary">
                Next <i class="fas fa-arrow-right ml-2"></i>
              </button>
              <button v-else type="submit" :disabled="isSubmitting" class="btn-primary bg-green-600 hover:bg-green-700 w-52" :class="{'opacity-50 cursor-not-allowed': isSubmitting}">
                <div class="flex items-center justify-center">
                  <i v-if="submissionStatus === 'uploading' || submissionStatus === 'processing'" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else-if="submissionStatus === 'uploaded' || submissionStatus === 'success'" class="fas fa-check mr-2"></i>
                  <span>{{ submitButtonText }}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import propertyService from '../../services/propertyService'; 
import { uploadImages } from '../../services/imageService';
import PropertyImageUpload from '../../components/PropertyImageUpload.vue';
import authService from '../../services/authService';

const router = useRouter();
const currentStep = ref(0);

const steps = [
  { title: 'Basics', icon: 'fas fa-info-circle', fullDescription: 'Let\'s start with the property title and description.' },
  { title: 'Details', icon: 'fas fa-ruler-combined', fullDescription: 'Provide key details like size and number of rooms.' },
  { title: 'Location', icon: 'fas fa-map-marker-alt', fullDescription: 'Where is your property located?' },
  { title: 'Pricing', icon: 'fas fa-dollar-sign', fullDescription: 'How much do you want to list it for?' },
  { title: 'Amenities', icon: 'fas fa-star', fullDescription: 'Select all the amenities available.' },
  { title: 'Images', icon: 'fas fa-images', fullDescription: 'Upload high-quality images of your property.' }
];

const formData = reactive({
  name: '',
  description: '',
  listingType: 'For Sale',
  propertyType: '',
  price: null,
  location: {
    address: '',
    city: '',
    state: 'Maharashtra',
    country: 'India',
    pincode: '',
  },
  specifications: {
    bedrooms: null,
    bathrooms: null,
    area: null,
  },
  amenities: [],
  images: [],
  ownerId: authService.getCurrentUser()?._id,
  status: 'active',
});

const selectedImageFiles = ref([]);
const availableAmenities = [ 'Parking', 'Garden', 'Swimming Pool', 'Gym', '24/7 Security', 'Power Backup', 'Elevator', 'Clubhouse', 'Kids Play Area', 'Wi-Fi' ];
const submissionStatus = ref('idle'); // 'idle', 'uploading', 'uploaded', 'processing', 'success'

const isSubmitting = computed(() => submissionStatus.value !== 'idle');

const submitButtonText = computed(() => {
    switch (submissionStatus.value) {
        case 'uploading': return 'Uploading Images...';
        case 'uploaded': return 'Images Uploaded!';
        case 'processing': return 'Creating Property...';
        case 'success': return 'Submitted!';
        default: return 'Submit Property';
    }
});

const setListingType = (type) => {
  formData.listingType = type;
};

const nextStep = () => { if (currentStep.value < steps.length - 1) currentStep.value++; };
const previousStep = () => { if (currentStep.value > 0) currentStep.value--; };

const handleImagesSelected = (imageFiles) => {
  selectedImageFiles.value = imageFiles;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    submissionStatus.value = 'uploading';
    let imageUrls = [];
    if (selectedImageFiles.value.length > 0) {
      imageUrls = await uploadImages(selectedImageFiles.value, 'properties');
    }

    submissionStatus.value = 'uploaded';
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to show message

    submissionStatus.value = 'processing';

    const data = new FormData();
    data.append('title', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('propertyType', formData.propertyType.toLowerCase());
    data.append('listingType', formData.listingType);

    const location = {
      address: formData.location.address,
      city: formData.location.city,
      state: formData.location.state || 'Maharashtra',
      country: formData.location.country || 'India',
      pinCode: formData.location.pincode,
    };
    data.append('location', JSON.stringify(location));

    data.append('bedrooms', formData.specifications.bedrooms);
    data.append('bathrooms', formData.specifications.bathrooms);
    data.append('area', formData.specifications.area);

    // Convert amenities array to a comma-separated string
    if (formData.amenities && formData.amenities.length > 0) {
      data.append('amenities', formData.amenities.join(','));
    }

    // Append image URLs as JSON string (similar to location)
    // This ensures the backend can properly parse it as an array
    if (imageUrls && imageUrls.length > 0) {
      data.append('images', JSON.stringify(imageUrls));
    } else {
      data.append('images', JSON.stringify([]));
    }
    
    data.append('ownerId', formData.ownerId);
    data.append('status', formData.status);

    await propertyService.createProperty(data);

    submissionStatus.value = 'success';
    setTimeout(() => {
      router.push({ name: 'PropertySuccess' }); 
    }, 1500);

  } catch (error) {
    console.error('Failed to create property:', error);
    alert('An error occurred while creating the property. Please check the console for details and try again.');
    submissionStatus.value = 'idle'; // Reset on error
  }
};

</script>

<style scoped>
.form-group label {
  @apply block text-sm font-bold text-gray-700 mb-2;
}
.form-group input, .form-group textarea, .form-group select {
  @apply w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 transition duration-300;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white;
}

.option-button {
  @apply w-full p-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold flex items-center justify-center text-base;
  @apply transition-all duration-300 ease-in-out transform hover:-translate-y-1;
}
.option-button.active {
  @apply bg-blue-500 border-blue-500 text-white shadow-lg;
}

.amenity-label {
  @apply flex items-center p-3 rounded-lg border-2 border-gray-300 bg-white cursor-pointer;
  @apply transition-all duration-200 ease-in-out hover:border-blue-400;
}
.amenity-label.active {
  @apply bg-blue-50 border-blue-500 text-blue-600 font-semibold;
}
.amenity-label.active i {
  @apply text-blue-500;
}

.btn-primary {
  @apply bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center;
  @apply transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 shadow-md;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full flex items-center justify-center;
  @apply transition-all duration-300 ease-in-out hover:bg-gray-300;
}

/* Fade transition for steps */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>