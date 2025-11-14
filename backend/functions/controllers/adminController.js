const User = require('../models/User');
const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get all properties (pending/approved)
// @route   GET /api/admin/properties
// @access  Private/Admin
const getAdminProperties = asyncHandler(async (req, res) => {
  const {status} = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const properties = await Property.find(filter).populate('user', 'name mobile');
  res.json(properties);
});

// @desc    Admin: Approve property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private/Admin
const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (property) {
    property.status = 'approved';
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// @desc    Admin: Reject property
// @route   PUT /api/admin/properties/:id/reject
// @access  Private/Admin
const rejectProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (property) {
    property.status = 'rejected';
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

module.exports = {
  getUsers,
  getAdminProperties,
  approveProperty,
  rejectProperty,
};
