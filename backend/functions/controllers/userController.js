const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // The user object, which comes from our database, is attached to the request
  // by the 'protect' middleware. We can trust it is valid.
  const user = req.user;

  if (user) {
    // Ensure the response matches the data structure of your User model.
    res.json({
      id: user.id, // Use 'id', not '_id'
      name: user.name,
      phone: user.phone, // Use 'phone', not 'mobile'
      email: user.email,
      role: user.role,
      aadhaar: user.aadhaar,
      createdAt: user.createdAt,
    });
  } else {
    // This case should not be reached if the 'protect' middleware is effective.
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // The user's ID comes from the middleware
  const { name, email } = req.body; // Extract fields to update from the request body

  // Construct the data object for the update.
  // The User.update model method handles the `updatedAt` timestamp automatically.
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  // Check if there is anything to update.
  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error('No update data provided.');
  }

  try {
    // Use the static User.update method from the model, which is designed for Firestore.
    const updatedUser = await User.update(userId, updateData);

    if (updatedUser) {
      res.json(updatedUser); // Send the full, updated user object back.
    } else {
      res.status(404);
      throw new Error('User not found after update attempt.');
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Error updating user profile: ${error.message}`);
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
};
