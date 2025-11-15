const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { processImages } = require('../utils/imageUpload');

// @desc    Fetch all properties, optionally filtered
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const { propertyType, minPrice, maxPrice, bedrooms, bathrooms, latitude, longitude, address, featured, limit } = req.query;
  let filter = {};

  if (propertyType) {
    filter.propertyType = propertyType;
  }
  if (minPrice) {
    filter.price = { ...filter.price, $gte: Number(minPrice) };
  }
  if (maxPrice) {
    filter.price = { ...filter.price, $lte: Number(maxPrice) };
  }
  if (bedrooms) {
    filter.bedrooms = Number(bedrooms);
  }
  if (bathrooms) {
    filter.bathrooms = Number(bathrooms);
  }
  if (address) {
    filter.address = { $regex: address, $options: 'i' };
  }
  if (latitude && longitude) {
    filter.latitude = Number(latitude);
    filter.longitude = Number(longitude);
  }
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  let query = Property.find(filter);

  if (limit) {
    query = query.limit(Number(limit));
  }

  const properties = await query;
  res.json(properties);
});

// @desc    Fetch single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (property) {
    res.json(property);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// @desc    Create a property with images
// @route   POST /api/properties
// @access  Private
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

  // Process uploaded images
  let images = [];
  if (req.files && req.files.length > 0) {
    const processedImages = await processImages(req.files, {
      maxSizeInBytes: 2 * 1024 * 1024, // 2MB
      quality: 80,
      format: 'webp'
    });
    
    // Extract base64 data URLs
    images = processedImages.map(img => img.data);
  }

  const property = new Property({
    title,
    description,
    price,
    address,
    latitude: latitude ? Number(latitude) : undefined,
    longitude: longitude ? Number(longitude) : undefined,
    propertyType,
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
    area: Number(area),
    amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
    images,
    user: req.user._id,
  });

  const createdProperty = await property.save();
  res.status(201).json({
    success: true,
    data: createdProperty,
    message: 'Property created successfully'
  });
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const updateData = req.body;

  const property = await Property.findById(propertyId);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  if (property.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  // Process new uploaded images if any
  if (req.files && req.files.length > 0) {
    const processedImages = await processImages(req.files, {
      maxSizeInBytes: 2 * 1024 * 1024,
      quality: 80,
      format: 'webp'
    });
    
    const newImages = processedImages.map(img => img.data);
    
    // Append new images to existing ones
    updateData.images = [...property.images, ...newImages];
  }

  // Update property fields
  Object.keys(updateData).forEach(key => {
    if (key === 'amenities' && typeof updateData[key] === 'string') {
      property[key] = JSON.parse(updateData[key]);
    } else {
      property[key] = updateData[key];
    }
  });

  const updatedProperty = await property.save();
  res.json({
    success: true,
    data: updatedProperty,
    message: 'Property updated successfully'
  });
});

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (property) {
    if (property.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this property');
    }
    
    await property.deleteOne();
    res.json({ 
      success: true,
      message: 'Property removed' 
    });
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// @desc    Upload images to existing property
// @route   POST /api/properties/:id/images
// @access  Private
const uploadPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  if (property.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }

  // Check total image count
  if (property.images.length + req.files.length > 10) {
    res.status(400);
    throw new Error('Maximum 10 images allowed per property');
  }

  // Process uploaded images
  const processedImages = await processImages(req.files, {
    maxSizeInBytes: 2 * 1024 * 1024,
    quality: 80,
    format: 'webp'
  });
  
  const newImages = processedImages.map(img => img.data);
  
  // Add new images to property
  property.images = [...property.images, ...newImages];
  await property.save();

  res.status(200).json({
    success: true,
    images: newImages,
    totalImages: property.images.length,
    message: 'Images uploaded successfully'
  });
});

// @desc    Delete specific image from property
// @route   DELETE /api/properties/:id/images/:imageIndex
// @access  Private
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  if (property.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  const imageIndex = parseInt(req.params.imageIndex);

  if (imageIndex < 0 || imageIndex >= property.images.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }

  // Remove image at index
  property.images.splice(imageIndex, 1);
  await property.save();

  res.json({
    success: true,
    message: 'Image deleted successfully',
    remainingImages: property.images.length
  });
});

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
const searchProperties = asyncHandler(async (req, res) => {
  const { keyword, propertyType, minPrice, maxPrice, bedrooms, bathrooms, latitude, longitude, address } = req.query;
  let filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { address: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (propertyType) {
    filter.propertyType = propertyType;
  }
  if (minPrice) {
    filter.price = { ...filter.price, $gte: Number(minPrice) };
  }
  if (maxPrice) {
    filter.price = { ...filter.price, $lte: Number(maxPrice) };
  }
  if (bedrooms) {
    filter.bedrooms = Number(bedrooms);
  }
  if (bathrooms) {
    filter.bathrooms = Number(bathrooms);
  }
  if (address) {
    filter.address = { $regex: address, $options: 'i' };
  }
  if (latitude && longitude) {
    filter.latitude = Number(latitude);
    filter.longitude = Number(longitude);
  }

  const properties = await Property.find(filter);
  res.json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// @desc    Get user's properties
// @route   GET /api/properties/user/my-properties
// @access  Private
const getUserProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ user: req.user._id }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: properties.length,
    data: properties
  });
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  searchProperties,
  getUserProperties
};
