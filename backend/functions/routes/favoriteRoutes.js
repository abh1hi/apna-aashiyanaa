const express = require('express');
const router = express.Router();
const {getFavorites, addFavorite, removeFavorite} = require('../controllers/favoriteController');
const {protect} = require('../middleware/authMiddleware');

router.route('/').get(protect, getFavorites);
router.route('/:id').post(protect, addFavorite);
router.route('/:id').delete(protect, removeFavorite);

module.exports = router;
