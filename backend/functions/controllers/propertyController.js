const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');
const { processImages } = require('../utils/imageUpload');

// Get all properties
const getProperties = asyncHandler(async (req, res) => {
  const { propertyType, minPrice, maxPrice, bedrooms, featured, limit } = req.query;
  const filters = {
    limit: limit ? Number(limit) : undefined,
    propertyType: propertyType,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    isFeatured: featured === 'true' ? true : undefined,
  };
  Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
  const properties = await Property.findAll(filters);
  res.json(properties);
});

// Get a single property by ID
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (property) {
    res.json(property);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// Create a property with images
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    address,
    latitude,
    longitude,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
  } = req.body;
  let images = [];
  if (req.files && req.files.length > 0) {
    const processedImages = await processImages(req.files, {
      maxSizeInBytes: 2 * 1024 * 1024, quality: 80, format: 'webp' });
    images = processedImages.map(img => img.data);
  }
  const amenitiesArr = amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [];
  const propertyData = {
    title, description, price: Number(price), address,
    latitude: latitude ? Number(latitude) : undefined,
    longitude: longitude ? Number(longitude) : undefined,
    propertyType, bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
    area: Number(area), amenities: amenitiesArr, images, ownerId: req.user._id
  };
  const createdProperty = await Property.create(propertyData);
  res.status(201).json({ success: true, data: createdProperty, message: 'Property created successfully' });
});

// Update property by ID
const updateProperty = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const updateData = req.body;
  if (updateData.amenities && typeof updateData.amenities === 'string') {
    updateData.amenities = JSON.parse(updateData.amenities);
  }
  if (req.files && req.files.length > 0) {
    const processedImages = await processImages(req.files, {
      maxSizeInBytes: 2 * 1024 * 1024, quality: 80, format: 'webp' });
    updateData.images = processedImages.map(img => img.data);
  }
  const updated = await Property.update(propertyId, updateData);
  res.json({ success: true, data: updated, message: 'Property updated successfully' });
});

// Get properties for current user
const getUserProperties = asyncHandler(async (req, res) => {
  const properties = await Property.findAll({ ownerId: req.user._id, orderBy: 'createdAt', orderDirection: 'desc' });
  res.json({ success: true, count: properties.length, data: properties });
});

// Delete a property
const deleteProperty = asyncHandler(async (req, res) => {
  await Property.delete(req.params.id);
  res.json({ success: true, message: 'Property removed' });
});

// Upload images to existing property
const uploadPropertyImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }
  const processedImages = await processImages(req.files, { maxSizeInBytes: 2 * 1024 * 1024, quality: 80, format: 'webp' });
  res.status(200).json({ success: true, images: processedImages.map(img => img.data), message: 'Images uploaded successfully' });
});

// Delete specific image from property
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const imageIndex = parseInt(req.params.imageIndex);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }
  if (!Array.isArray(property.images) || imageIndex < 0 || imageIndex >= property.images.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }
  property.images.splice(imageIndex, 1);
  await Property.update(req.params.id, { images: property.images });
  res.json({ success: true, message: 'Image deleted successfully', remainingImages: property.images.length });
});

// Search properties
const searchProperties = asyncHandler(async (req, res) => {
  const { keyword, propertyType, minPrice, maxPrice, bedrooms } = req.query;
  const filters = {
    propertyType,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
  };
  Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
  const properties = await Property.search(keyword || '', filters);
  res.json({ success: true, count: properties.length, data: properties });
});

module.exports = {
  getProperties,
  getPropertyById,
  getUserProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  searchProperties,
};
