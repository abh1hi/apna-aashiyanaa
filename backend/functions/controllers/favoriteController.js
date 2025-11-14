const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findOne({user: req.user.id}).populate('properties');
    if (!favorites) {
      return res.json([]);
    }
    res.json(favorites.properties);
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};

// @desc    Add property to favorites
// @route   POST /api/favorites/:id
// @access  Private
exports.addFavorite = async (req, res) => {
  const {id} = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({message: 'Property not found'});
    }

    let favorites = await Favorite.findOne({user: req.user.id});

    if (!favorites) {
      favorites = await Favorite.create({user: req.user.id, properties: [id]});
    } else {
      if (favorites.properties.includes(id)) {
        return res.status(400).json({message: 'Property already in favorites'});
      }
      favorites.properties.push(id);
      await favorites.save();
    }

    const populatedFavorites = await Favorite.findById(favorites._id).populate('properties');
    res.status(201).json(populatedFavorites.properties);
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res) => {
  const {id} = req.params;

  try {
    const favorites = await Favorite.findOne({user: req.user.id});

    if (!favorites) {
      return res.status(404).json({message: 'Favorites not found'});
    }

    favorites.properties = favorites.properties.filter(
        (propertyId) => propertyId.toString() !== id,
    );

    await favorites.save();
    const populatedFavorites = await Favorite.findById(favorites._id).populate('properties');

    res.json(populatedFavorites.properties);
  } catch (error) {
    res.status(500).json({message: 'Server Error'});
  }
};
