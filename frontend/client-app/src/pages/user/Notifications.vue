<template>

<div>
    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

      <!-- No Notifications -->
      <div v-if="notifications.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 text-gray-400 mx-auto rounded-full flex items-center justify-center mb-6">
            <i class="fas fa-bell-slash text-4xl"></i>
          </div>
          <h3 class="text-2xl font-semibold text-gray-800 mb-2">No notifications yet</h3>
          <p class="text-gray-500 max-w-md mx-auto">You'll see updates about your properties, messages, and account activity here.</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-4">
        <div v-for="notification in notifications" :key="notification.id" 
             :class="['notification-item', {'is-unread': !notification.read}]" 
             @click="handleNotificationClick(notification)">
          
          <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <i :class="notificationIcon(notification.type)"></i>
          </div>

          <div class="flex-grow">
            <p class="font-semibold text-gray-900">{{ notification.title }}</p>
            <p class="text-sm text-gray-600">{{ notification.message }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ timeAgo(notification.timestamp) }}</p>
          </div>

          <div v-if="!notification.read" class="w-3 h-3 bg-blue-500 rounded-full ml-4 flex-shrink-0" title="Unread"></div>
        </div>
         <div class="text-center mt-6">
          <button @click="markAllAsRead" v-if="unreadCount > 0" class="text-sm text-blue-600 hover:underline">Mark all as read</button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notifications = ref([
  { id: 1, type: 'message', title: 'New Message from John Doe', message: 'Regarding your property listing...', read: false, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
  { id: 2, type: 'favorite', title: 'Property Favorited', message: 'Someone favorited your Modern Downtown Apartment.', read: false, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 3, type: 'listing', title: 'Listing Approved', message: 'Your property listing for Sunny Beachside Villa is now live!', read: true, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: 4, type: 'account', title: 'Profile Updated', message: 'Your profile information was successfully updated.', read: true, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const notificationIcon = (type) => {
  switch (type) {
    case 'message': return 'fas fa-comment-dots'
    case 'favorite': return 'fas fa-heart'
    case 'listing': return 'fas fa-building'
    case 'account': return 'fas fa-user-circle'
    default: return 'fas fa-bell'
  }
}

const timeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
  let interval = seconds / 31536000; if (interval > 1) { return Math.floor(interval) + " years ago"; }
  interval = seconds / 2592000; if (interval > 1) { return Math.floor(interval) + " months ago"; }
  interval = seconds / 86400; if (interval > 1) { return Math.floor(interval) + " days ago"; }
  interval = seconds / 3600; if (interval > 1) { return Math.floor(interval) + " hours ago"; }
  interval = seconds / 60; if (interval > 1) { return Math.floor(interval) + " minutes ago"; }
  return Math.floor(seconds) + " seconds ago";
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const handleNotificationClick = (notification) => {
  notification.read = true
  if (notification.type === 'message') {
    router.push('/user/chat')
  } else if (notification.type === 'listing') {
    router.push('/user/my-listings')
  }
}

</script>

<style scoped>
.notification-item {
  @apply flex items-center bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition duration-300 ease-in-out;
}
.notification-item:hover {
  @apply shadow-md transform -translate-y-px bg-gray-50;
}
.notification-item.is-unread {
  @apply bg-blue-50 border-blue-200;
}
</style>