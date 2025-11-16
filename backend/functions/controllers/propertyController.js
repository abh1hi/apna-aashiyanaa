const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');
const { cleanupPropertyImages } = require('../utils/imageCleanup');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  try {
    console.log('createProperty req.body:', req.body);
    console.log('createProperty req.files:', req.files);
    
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

    // Normalize images array - support both old format (URL strings) and new format (metadata objects)
    let normalizedImages = [];
    if (images) {
      if (Array.isArray(images)) {
        normalizedImages = images
          .filter(img => img !== null && img !== undefined)
          .map((img, index) => {
            // If it's already an object with metadata, use it
            if (typeof img === 'object' && img.url) {
              return {
                ...img,
                order: img.order !== undefined ? img.order : index
              };
            }
            // If it's a string URL (old format), convert to new format
            if (typeof img === 'string' && img.trim() !== '') {
              return {
                url: img.trim(),
                order: index,
                uploadedAt: new Date()
              };
            }
            return null;
          })
          .filter(img => img !== null);
      } else if (typeof images === 'string') {
        // Try to parse as JSON array
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) {
            normalizedImages = parsed
              .filter(img => img !== null && img !== undefined)
              .map((img, index) => {
                if (typeof img === 'object' && img.url) {
                  return { ...img, order: img.order !== undefined ? img.order : index };
                }
                if (typeof img === 'string' && img.trim() !== '') {
                  return { url: img.trim(), order: index, uploadedAt: new Date() };
                }
                return null;
              })
              .filter(img => img !== null);
          } else if (parsed.trim() !== '') {
            normalizedImages = [{ url: parsed.trim(), order: 0, uploadedAt: new Date() }];
          }
        } catch (e) {
          // Not JSON, treat as single URL string
          if (images.trim() !== '') {
            normalizedImages = [{ url: images.trim(), order: 0, uploadedAt: new Date() }];
          }
        }
      }
    }

    const propertyData = {
      title, // Use title from validation
      description,
      listingType,
      propertyType,
      price: parseFloat(price),
      location,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseFloat(bathrooms),
      area: parseFloat(area),
      amenities: amenities ? (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()) : amenities) : [],
      images: normalizedImages, // Array of image metadata objects
      ownerId,
      status: 'active',
    };

    console.log('propertyData before create:', JSON.stringify(propertyData, null, 2));
    console.log('Images array:', normalizedImages);

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

  // Soft delete the property first
  await Property.delete(req.params.id);

  // Clean up associated images from storage
  try {
    const cleanupResult = await cleanupPropertyImages(property);
    console.log(`Property ${req.params.id} deleted. Images cleanup:`, cleanupResult);
  } catch (cleanupError) {
    // Log error but don't fail the deletion if cleanup fails
    console.error('Error cleaning up property images:', cleanupError);
  }

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

// @desc    Delete a specific image from a property
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is the owner
  if (property.ownerId !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to modify this property');
  }

  const imageId = req.params.imageId;
  const images = property.images || [];
  
  // Find the image to delete
  const imageIndex = images.findIndex(img => {
    if (typeof img === 'object') {
      return img.id === imageId || img.url === imageId;
    }
    return img === imageId;
  });

  if (imageIndex === -1) {
    res.status(404);
    throw new Error('Image not found');
  }

  const imageToDelete = images[imageIndex];
  
  // Delete from storage if path is available
  if (typeof imageToDelete === 'object' && imageToDelete.path) {
    try {
      const { deleteImagesFromStorage } = require('../utils/imageCleanup');
      await deleteImagesFromStorage([imageToDelete.path]);
    } catch (cleanupError) {
      console.error('Error deleting image from storage:', cleanupError);
      // Continue with Firestore update even if storage deletion fails
    }
  }

  // Remove image from array
  images.splice(imageIndex, 1);
  
  // Update property
  const updatedProperty = await Property.update(req.params.id, { images });
  res.json(updatedProperty);
});

// @desc    Reorder property images
// @route   PUT /api/properties/:id/images/reorder
// @access  Private
const reorderPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is the owner
  if (property.ownerId !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to modify this property');
  }

  const { imageIds } = req.body; // Array of image IDs in desired order

  if (!Array.isArray(imageIds)) {
    res.status(400);
    throw new Error('imageIds must be an array');
  }

  const images = property.images || [];
  const reorderedImages = imageIds.map((imageId, index) => {
    const image = images.find(img => {
      if (typeof img === 'object') {
        return img.id === imageId || img.url === imageId;
      }
      return img === imageId;
    });
    
    if (!image) {
      res.status(400);
      throw new Error(`Image with ID ${imageId} not found`);
    }

    // Return image object with updated order
    if (typeof image === 'object') {
      return { ...image, order: index };
    }
    return { url: image, order: index, uploadedAt: new Date() };
  });

  // Update property with reordered images
  const updatedProperty = await Property.update(req.params.id, { images: reorderedImages });
  res.json(updatedProperty);
});


module.exports = {
  createProperty,
  getProperties,
  getPropertyByIdOrSlug,
  updateProperty,
  deleteProperty,
  searchProperties,
  getUserProperties,
  deletePropertyImage,
  reorderPropertyImages
};
