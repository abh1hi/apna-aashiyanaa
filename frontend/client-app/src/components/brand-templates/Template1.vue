<template>
  <div v-if="brand">
    <BrandHero 
      :store-name="brand.storeName"
      :tagline="brand.tagline"
      :logo-url="brand.logoUrl"
      :hero-image-url="brand.heroImageUrl"
    />
    <BrandAbout :about-us="brand.aboutUs" />
    <BrandProductList :products="products" />
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