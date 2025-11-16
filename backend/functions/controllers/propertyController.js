const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  const { name, description, listingType, propertyType, price, amenities, images } = req.body;

  // Parse stringified fields
  const location = JSON.parse(req.body.location);
  const specifications = JSON.parse(req.body.specifications);

  // Get owner ID from authenticated user
  const ownerId = req.user._id;

  const propertyData = {
    name,
    description,
    listingType,
    propertyType,
    price,
    location,
    ...specifications,
    amenities: amenities ? amenities.split(',') : [],
    images, // These are URLs from processAndAttachUrls middleware
    ownerId,
    status: 'active',
  };

  const property = await Property.create(propertyData);

  res.status(201).json(property);
});

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const properties = await Property.findAll(req.query);
  res.json(properties);
});

// @desc    Get a single property by ID or slug
// @route   GET /api/properties/:idOrSlug
// @access  Public
const getPropertyByIdOrSlug = asyncHandler(async (req, res) => {
  let property = await Property.findBySlug(req.params.idOrSlug);
  if (!property) {
    property = await Property.findById(req.params.idOrSlug);
  }

  if (property) {
    res.json(property);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is the owner (compare with firebaseUid)
  if (property.ownerId !== req.user.firebaseUid) {
    res.status(401);
    throw new Error('Not authorized to update this property');
  }

  const updatedProperty = await Property.update(req.params.id, req.body);
  res.json(updatedProperty);
});

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is the owner (compare with firebaseUid)
  if (property.ownerId !== req.user.firebaseUid) {
    res.status(401);
    throw new Error('Not authorized to delete this property');
  }

  await Property.delete(req.params.id);
  res.json({ message: 'Property removed' });
});

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
const searchProperties = asyncHandler(async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});


// @desc    Get properties for a specific user
// @route   GET /api/properties/user/my-properties
// @access  Private
const getUserProperties = asyncHandler(async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});


module.exports = {
  createProperty,
  getProperties,
  getPropertyByIdOrSlug,
  updateProperty,
  deleteProperty,
  searchProperties,
  getUserProperties
};
