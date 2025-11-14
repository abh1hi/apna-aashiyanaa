
import { apiClient } from '../config/api';

const startChat = (data) => {
  return apiClient.post('/chat/start', data);
};

const getChatMessages = (chatId) => {
  return apiClient.get(`/chat/${chatId}/messages`);
};

export default {
  startChat,
  getChatMessages,
};
