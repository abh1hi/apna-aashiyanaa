const express = require('express');
const router = express.Router();
const {
  getConversations,
  sendMessage,
  getMessagesWithUser,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(protect);

router.route('/conversations').get(getConversations);
router.route('/').post(sendMessage);
router.route('/:otherUserId').get(getMessagesWithUser);

module.exports = router;
