const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  try {
    console.log('createProperty req.body:', req.body);
    console.log('createProperty req.files:', req.files ? `${req.files.length} files` : 'no files');
    
    const { title, description, listingType, propertyType, price, bedrooms, bathrooms, area, amenities, images } = req.body;

    // Parse stringified location field when necessary. If middleware already parsed it,
    // `req.body.location` will be an object — in that case use it directly.
    let location;
    if (req.body.location && typeof req.body.location === 'string') {
      try {
        location = JSON.parse(req.body.location);
      } catch (parseErr) {
        console.error('Error parsing location:', parseErr);
        res.status(400);
        throw new Error(`Invalid location format: ${parseErr.message}`);
      }
    } else if (req.body.location && typeof req.body.location === 'object') {
      location = req.body.location;
    } else {
      location = {};
    }

    // Get owner ID from authenticated user
    const ownerId = req.user.id;

    const propertyData = {
      title, // Use title from validation
      description,
      listingType,
      propertyType,
      price,
      location,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseFloat(bathrooms),
      area: parseFloat(area),
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      images: images && images.length > 0 ? images : [], // These are URLs from middleware or empty array
      ownerId,
      status: 'active',
    };

    console.log('propertyData before create:', propertyData);
    console.log(`Saving property with ${propertyData.images.length} image(s)`);

    const property = await Property.create(propertyData);
    console.log('Property created successfully:', property.id);

    res.status(201).json(property);
  } catch (error) {
    console.error('Error in createProperty:', error);
    throw error;
  }
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

  // Check if user is the owner
  if (property.ownerId !== req.user.id) {
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

  // Check if user is the owner
  if (property.ownerId !== req.user.id) {
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
  const { q, city, propertyType, minPrice, maxPrice, bedrooms } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const filters = {
    status: 'active',
    city: city || undefined,
    propertyType: propertyType || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    bedrooms: bedrooms || undefined,
  };

  // Remove undefined filters
  Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

  const results = await Property.search(q, filters);
  res.json(results);
});


// @desc    Get properties for a specific user
// @route   GET /api/properties/user/my-properties
// @access  Private
const getUserProperties = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = 'active', limit = 50, startAfter } = req.query;

  const filters = {
    ownerId: userId,
    status,
    limit: parseInt(limit),
  };

  if (startAfter) filters.startAfter = startAfter;

  const properties = await Property.findAll(filters);
  res.json(properties);
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
