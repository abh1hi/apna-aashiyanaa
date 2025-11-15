const express = require('express');
const router = express.Router();
const { startChat, getChatMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/start').post(protect, startChat);
router.route('/:chatId/messages').get(protect, getChatMessages);

module.exports = router;
