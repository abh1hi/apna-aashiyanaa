<template>
  <div class="contact-page mobile-first">
    <!-- Mobile Header -->
    <header class="mobile-header" v-if="isMobile">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="page-title">Contact Us</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- Desktop Page Header -->
    <AppHeader v-if="!isMobile" title="Contact Us" />

    <main class="main-content">
      <div class="container">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h2 v-if="!isMobile">Get in Touch</h2>
            <p class="hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        <!-- Contact Content Grid -->
        <div class="contact-grid">
          <!-- Contact Form -->
          <div class="contact-form-section">
            <div class="form-card">
              <div class="card-header">
                <h3>Send us a Message</h3>
                <p>Fill out the form below and we'll get back to you within 24 hours</p>
              </div>

              <form @submit.prevent="submitForm" class="contact-form">
                <div class="form-group">
                  <label for="name" class="form-label">
                    <i class="fas fa-user"></i>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="form.name" 
                    :class="['form-input', { error: errors.name }]"
                    placeholder="Enter your full name"
                    required
                    @blur="validateField('name')"
                    @input="clearError('name')"
                  >
                  <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">
                    <i class="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="form.email" 
                    :class="['form-input', { error: errors.email }]"
                    placeholder="Enter your email address"
                    required
                    @blur="validateField('email')"
                    @input="clearError('email')"
                  >
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                  <label for="subject" class="form-label">
                    <i class="fas fa-tag"></i>
                    Subject
                  </label>
                  <select 
                    id="subject" 
                    v-model="form.subject" 
                    :class="['form-input', { error: errors.subject }]"
                    required
                    @change="clearError('subject')"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                  <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
                </div>

                <div class="form-group">
                  <label for="message" class="form-label">
                    <i class="fas fa-comment-alt"></i>
                    Message
                  </label>
                  <textarea 
                    id="message" 
                    v-model="form.message" 
                    :class="['form-textarea', { error: errors.message }]"
                    rows="5" 
                    placeholder="Tell us how we can help you..."
                    required
                    @blur="validateField('message')"
                    @input="clearError('message')"
                  ></textarea>
                  <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
                  <div class="character-count">
                    {{ form.message.length }}/500 characters
                  </div>
                </div>

                <button 
                  type="submit" 
                  :class="['submit-btn', { loading: isSubmitting }]"
                  :disabled="isSubmitting"
                >
                  <span v-if="!isSubmitting">
                    <i class="fas fa-paper-plane"></i>
                    Send Message
                  </span>
                  <span v-else>
                    <i class="fas fa-spinner fa-spin"></i>
                    Sending...
                  </span>
                </button>
              </form>

              <!-- Success Message -->
              <div v-if="showSuccess" class="success-message">
                <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                <button @click="resetForm" class="new-message-btn">
                  Send Another Message
                </button>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="contact-info-section">
            <div class="info-card">
              <div class="card-header">
                <h3>Contact Information</h3>
                <p>Reach out to us through any of these channels</p>
              </div>

              <div class="contact-methods">
                <div class="contact-method">
                  <div class="method-icon email">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="method-content">
                    <h4>Email Us</h4>
                    <p>hello@aura.com</p>
                    <span class="response-time">Response within 24 hours</span>
                  </div>
                </div>

                <div class="contact-method">
                  <div class="method-icon phone">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div class="method-content">
                    <h4>Call Us</h4>
                    <p>+1 (234) 567-890</p>
                    <span class="response-time">Mon-Fri, 9 AM - 6 PM EST</span>
                  </div>
                </div>

                <div class="contact-method">
                  <div class="method-icon location">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="method-content">
                    <h4>Visit Us</h4>
                    <p>123 Design Street<br>New York, NY 10001</p>
                    <span class="response-time">Mon-Fri, 9 AM - 5 PM</span>
                  </div>
                </div>

                <div class="contact-method">
                  <div class="method-icon chat">
                    <i class="fas fa-comments"></i>
                  </div>
                  <div class="method-content">
                    <h4>Live Chat</h4>
                    <p>Get instant support</p>
                    <button class="chat-btn" @click="openLiveChat">
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Card -->
            <div class="faq-card">
              <div class="card-header">
                <h3>Quick Help</h3>
                <p>Find answers to common questions</p>
              </div>
              
              <div class="quick-links">
                <router-link to="/faq" class="quick-link">
                  <i class="fas fa-question-circle"></i>
                  <span>FAQ</span>
                </router-link>
                <router-link to="/shipping" class="quick-link">
                  <i class="fas fa-shipping-fast"></i>
                  <span>Shipping Info</span>
                </router-link>
                <router-link to="/returns" class="quick-link">
                  <i class="fas fa-undo"></i>
                  <span>Returns</span>
                </router-link>
                <router-link to="/size-guide" class="quick-link">
                  <i class="fas fa-ruler"></i>
                  <span>Size Guide</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Bottom Navigation (if applicable) -->
    <nav v-if="isMobile" class="bottom-navigation">
      <router-link to="/" class="nav-item">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/shop" class="nav-item">
        <i class="fas fa-search"></i>
        <span>Shop</span>
      </router-link>
      <router-link to="/cart" class="nav-item">
        <i class="fas fa-shopping-bag"></i>
        <span>Cart</span>
      </router-link>
      <router-link to="/account" class="nav-item">
        <i class="fas fa-user"></i>
        <span>Account</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

// Reactive data
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const errors = reactive({})
const isSubmitting = ref(false)
const showSuccess = ref(false)
const isMobile = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return form.name && form.email && form.subject && form.message && 
         Object.keys(errors).length === 0
})

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const goBack = () => {
  router.go(-1)
}

const validateField = (field) => {
  delete errors[field]
  
  switch (field) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = 'Name is required'
      } else if (form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }
      break
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email.trim()) {
        errors.email = 'Email is required'
      } else if (!emailRegex.test(form.email)) {
        errors.email = 'Please enter a valid email address'
      }
      break
    case 'subject':
      if (!form.subject) {
        errors.subject = 'Please select a subject'
      }
      break
    case 'message':
      if (!form.message.trim()) {
        errors.message = 'Message is required'
      } else if (form.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters'
      } else if (form.message.length > 500) {
        errors.message = 'Message cannot exceed 500 characters'
      }
      break
  }
}

const clearError = (field) => {
  delete errors[field]
}

const validateForm = () => {
  validateField('name')
  validateField('email')
  validateField('subject')
  validateField('message')
  return Object.keys(errors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Show success message
    showSuccess.value = true
    
    // Reset form after success
    // Don't reset immediately to show success state
  } catch (error) {
    console.error('Error submitting form:', error)
    // Handle error (show error message)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
  showSuccess.value = false
}

const openLiveChat = () => {
  // Implement live chat functionality
  router.push('/chat')
}

// Lifecycle hooks
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Mobile-First Design */
.contact-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 80px;
}

/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 50;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #1a1a1a;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #f1f5f9;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* Main Content */
.main-content {
  margin-top: 70px;
  padding: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Contact Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

/* Cards */
.form-card,
.info-card,
.faq-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-card:hover,
.info-card:hover,
.faq-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.card-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.card-header p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Contact Form */
.contact-form {
  padding: 1rem 2rem 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: #9ca3af;
  width: 16px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background-color: #fafafa;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  background: #9ca3af;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.success-message h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.new-message-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.new-message-btn:hover {
  background: #e5e7eb;
}

/* Contact Methods */
.contact-methods {
  padding: 1rem 2rem 2rem;
}

.contact-method {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.contact-method:last-child {
  border-bottom: none;
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.method-icon.email { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.method-icon.phone { background: linear-gradient(135deg, #10b981, #047857); }
.method-icon.location { background: linear-gradient(135deg, #f59e0b, #d97706); }
.method-icon.chat { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.method-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.method-content p {
  color: #374151;
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.response-time {
  font-size: 0.8rem;
  color: #9ca3af;
}

.chat-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.3s ease;
}

.chat-btn:hover {
  background: #7c3aed;
}

/* Quick Links */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem 2rem 2rem;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  text-align: center;
}

.quick-link:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
}

.quick-link i {
  font-size: 1.5rem;
}

.quick-link span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Bottom Navigation */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 50;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #3b82f6;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.nav-item span {
  font-size: 0.7rem;
  font-weight: 500;
}

/* Desktop Styles */
@media (min-width: 769px) {
  .contact-page {
    padding-bottom: 0;
  }
  
  .mobile-header,
  .bottom-navigation {
    display: none;
  }
  
  .main-content {
    margin-top: 0;
    padding: 2rem;
  }
  
  .contact-grid {
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
  }
  
  .hero-content h2 {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .quick-links {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 1rem;
  }
  
  .hero-section {
    margin-bottom: 3rem;
  }
  
  .contact-grid {
    gap: 4rem;
  }
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card,
.info-card,
.faq-card {
  animation: slideUp 0.6s ease-out;
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-input,
  .form-textarea {
    border-width: 3px;
  }
  
  .method-icon {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>