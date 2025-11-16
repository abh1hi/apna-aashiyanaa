const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Create a new property
 * @route   POST /api/properties
 * @access  Private
 */
const createProperty = asyncHandler(async (req, res) => {
  const { name, description, price, location, specifications, amenities, categories, propertyType, listingType } = req.body;

  // Basic validation
  if (!name || !description || !price || !location || !propertyType || !listingType) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const ownerId = req.user._id; // Assumes auth middleware adds user to req

  const propertyData = {
    name,
    description,
    propertyType,
    listingType,
    price,
    location,
    specifications,
    amenities,
    categories,
    ownerId, // Link the property to the logged-in user
    images: req.body.images || [], // Images are optional at creation, can be added later
  };

  const property = await Property.create(propertyData);

  if (property) {
    res.status(201).json(property);
  } else {
    res.status(400);
    throw new Error('Invalid property data');
  }
});

/**
 * @desc    Get all properties with optional filters
 * @route   GET /api/properties
 * @access  Public
 */
const getProperties = asyncHandler(async (req, res) => {
  // Pass query params to the model for filtering
  const properties = await Property.findAll(req.query);
  res.json(properties);
});

/**
 * @desc    Get a single property by its ID
 * @route   GET /api/properties/:id
 * @access  Public
 */
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (property) {
    res.json(property);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
};
