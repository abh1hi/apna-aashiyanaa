<template>
  <footer class="bg-surface-dark text-on-surface-dark py-16 sm:py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <!-- Branding -->
        <div class="md:col-span-1">
          <router-link to="/" class="text-4xl font-black tracking-tighter text-on-surface-dark mb-4 block">AURA</router-link>
          <p class="text-base text-gray-400 max-w-xs">Elevating everyday essentials with a focus on quality, comfort, and sustainable design.</p>
          <div class="flex space-x-5 mt-6">
            <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-instagram text-xl"></i></a>
            <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-twitter text-xl"></i></a>
            <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-pinterest text-xl"></i></a>
          </div>
        </div>

        <!-- Links -->
        <div class="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-on-surface-dark tracking-wide">Shop</h3>
            <ul class="mt-5 space-y-3">
              <li><router-link to="/shop" class="text-base text-gray-400 hover:text-white transition-colors">All</router-link></li>
              <li><router-link to="/shop/new" class="text-base text-gray-400 hover:text-white transition-colors">New Arrivals</router-link></li>
              <li><router-link to="/shop/best" class="text-base text-gray-400 hover:text-white transition-colors">Best-Sellers</router-link></li>
              <li><router-link to="/shop/sale" class="text-base text-gray-400 hover:text-white transition-colors">Sale</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-on-surface-dark tracking-wide">About Us</h3>
            <ul class="mt-5 space-y-3">
              <li><router-link to="/about" class="text-base text-gray-400 hover:text-white transition-colors">Our Philosophy</router-link></li>
              <li><router-link to="/sustainability" class="text-base text-gray-400 hover:text-white transition-colors">Sustainability</router-link></li>
              <li><router-link to="/careers" class="text-base text-gray-400 hover:text-white transition-colors">Careers</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-on-surface-dark tracking-wide">Customer Service</h3>
            <ul class="mt-5 space-y-3">
              <li><router-link to="/contact" class="text-base text-gray-400 hover:text-white transition-colors">Contact</router-link></li>
              <li><router-link to="/faq" class="text-base text-gray-400 hover:text-white transition-colors">FAQs</router-link></li>
              <li><router-link to="/shipping" class="text-base text-gray-400 hover:text-white transition-colors">Shipping & Returns</router-link></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom section -->
      <div class="mt-16 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
        <p class="text-sm text-gray-500 text-center sm:text-left">&copy; {{ new Date().getFullYear() }} AURA Industries. All rights reserved.</p>
        <div class="flex items-center space-x-4 mt-4 sm:mt-0">
          <router-link to="/privacy" class="text-sm text-gray-500 hover:text-white">Privacy Policy</router-link>
          <router-link to="/terms" class="text-sm text-gray-500 hover:text-white">Terms of Service</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// FontAwesome has been added to the project to supply the social icons.
</script>
