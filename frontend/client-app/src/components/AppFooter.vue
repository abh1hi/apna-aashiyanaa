<template>
  <footer class="hidden md:block bg-surface-variant text-on-surface-variant py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      
      <!-- About Section -->
      <div class="md:col-span-1">
        <h3 class="text-xl font-bold mb-4">Apna Aashiyanaa</h3>
        <p class="text-sm text-secondary">
          Leading the way in real estate innovation. Find your next property with our advanced search and market insights.
        </p>
        <div class="flex space-x-4 mt-4">
          <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-instagram"></i></a>
          <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h4 class="font-bold text-lg mb-4">Quick Links</h4>
        <ul class="space-y-2 text-sm">
          <li><router-link to="/search" class="hover:text-primary">For Sale</router-link></li>
          <li><router-link to="/search?type=rent" class="hover:text-primary">For Rent</router-link></li>
          <li><router-link to="/agents" class="hover:text-primary">Find an Agent</router-link></li>
          <li><router-link to="/about" class="hover:text-primary">About Us</router-link></li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h4 class="font-bold text-lg mb-4">Contact Us</h4>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start">
            <i class="fas fa-map-marker-alt w-4 mr-2 mt-1"></i>
            <span>123 Market St, San Francisco, CA</span>
          </li>
          <li class="flex items-center">
            <i class="fas fa-phone-alt w-4 mr-2"></i>
            <span>(123) 456-7890</span>
          </li>
          <li class="flex items-center">
            <i class="fas fa-envelope w-4 mr-2"></i>
            <span>contact@apnaaashiyanaa.com</span>
          </li>
        </ul>
      </div>
      
      <!-- Newsletter -->
      <div>
        <h4 class="font-bold text-lg mb-4">Stay Updated</h4>
        <p class="text-sm text-secondary mb-3">Get the latest properties and market news.</p>
        <form @submit.prevent="">
          <div class="flex">
            <input type="email" placeholder="Your email" class="flex-grow py-2 px-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-surface">
            <button type="submit" class="bg-primary text-on-primary font-semibold px-4 rounded-r-md hover:bg-opacity-90">Sign Up</button>
          </div>
        </form>
      </div>

    </div>
    <div class="mt-8 pt-8 border-t border-outline text-center text-sm text-secondary">
      <p>&copy; {{ new Date().getFullYear() }} Apna Aashiyanaa. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
// No script needed for this simple component
</script>
