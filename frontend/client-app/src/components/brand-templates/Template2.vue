<template>
  <div v-if="brand" class="bg-gray-100">
    <BrandHero 
      :store-name="brand.storeName"
      :tagline="brand.tagline"
      :logo-url="brand.logoUrl"
      :hero-image-url="brand.heroImageUrl"
    />
    
    <div class="flex flex-col lg:flex-row-reverse">
      <div class="w-full lg:w-1/3 p-8">
        <BrandAbout :about-us="brand.aboutUs" />
      </div>
      <div class="w-full lg:w-2/3">
        <BrandProductList :products="products" />
      </div>
    </div>

    <BrandFooter 
      :store-name="brand.storeName"
      :social-links="brand.socialLinks"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import BrandHero from '../brand-ui/BrandHero.vue';
import BrandAbout from '../brand-ui/BrandAbout.vue';
import BrandProductList from '../brand-ui/BrandProductList.vue';
import BrandFooter from '../brand-ui/BrandFooter.vue';

defineProps({
  brand: Object,
  products: Array,
});
</script>