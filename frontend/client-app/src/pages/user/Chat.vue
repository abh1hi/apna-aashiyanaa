<template>
  <div class="chat-page min-h-screen bg-white text-gray-900">
    <!-- Page Header -->
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Chat</h1>
        <p class="text-gray-600 text-lg">Your conversations with other users</p>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-300px)]">
          <!-- Conversations List -->
          <div class="col-span-1 border-r border-gray-200 overflow-y-auto">
            <div class="p-4 border-b border-gray-200">
                <input type="text" placeholder="Search chats..." class="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <ul>
              <li v-for="convo in conversations" :key="convo.id" @click="selectedConversation = convo" :class="{'bg-blue-50': selectedConversation && selectedConversation.id === convo.id}" class="p-4 hover:bg-gray-50 cursor-pointer flex items-center">
                <img :src="convo.avatar" class="w-12 h-12 rounded-full mr-4">
                <div>
                  <p class="font-semibold">{{ convo.name }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ convo.lastMessage }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Messages View -->
          <div class="col-span-2 flex flex-col">
            <div v-if="selectedConversation" class="flex-1 p-6 overflow-y-auto bg-gray-50">
              <!-- Message Bubbles -->
              <div v-for="message in selectedConversation.messages" :key="message.id" :class="message.sent ? 'justify-end' : 'justify-start'" class="flex mb-4">
                <div :class="message.sent ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'" class="rounded-lg px-4 py-2 max-w-sm shadow-sm">
                  {{ message.text }}
                </div>
              </div>
            </div>
            <div v-else class="flex-1 flex items-center justify-center text-center bg-gray-50">
                <div>
                    <i class="fas fa-comments text-6xl text-gray-300"></i>
                    <p class="mt-4 text-gray-500">Select a conversation to start messaging</p>
                </div>
            </div>

            <!-- Message Input -->
            <div v-if="selectedConversation" class="p-4 bg-white border-t border-gray-200">
              <div class="flex items-center">
                <input type="text" placeholder="Type a message..." class="w-full bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent focus:border-transparent">
                <button class="ml-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><i class="fas fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const conversations = ref([
  {
    id: 1, name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe',
    lastMessage: 'Hey, how are you?', 
    messages: [
        {id: 1, text: 'Hi there!', sent: false},
        {id: 2, text: 'Hey, how are you?', sent: true},
    ]
  },
  {
    id: 2, name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith',
    lastMessage: 'I am interested in the property...', 
    messages: [
        {id: 1, text: 'I am interested in the property you listed.', sent: false}
    ]
  }
]);

const selectedConversation = ref(null);
</script>
