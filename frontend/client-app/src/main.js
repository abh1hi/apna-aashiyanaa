import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

// Import the long press directive
import longPress from './directives/longPress'

// Create Pinia instance
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Register the long-press directive
app.directive('long-press', longPress)

// Use plugins
app.use(pinia)
app.use(router)

// Mount app
if (typeof document !== 'undefined') {
  app.mount('#app')
}