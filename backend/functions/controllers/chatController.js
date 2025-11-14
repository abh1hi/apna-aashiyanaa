const Chat = require('../models/Chat');
const asyncHandler = require('express-async-handler');

// @desc    Initiate chat with property owner
// @route   POST /api/chat/start
// @access  Private
const startChat = asyncHandler(async (req, res) => {
  const { ownerId } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findOneAndUpdate(
    { users: { $all: [userId, ownerId] } },
    { $setOnInsert: { users: [userId, ownerId] } },
    { new: true, upsert: true }
  );

  res.status(200).json(chat);
});

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId).populate('messages.sender', 'name');

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.status(200).json(chat.messages);
});

module.exports = {
  startChat,
  getChatMessages,
};
