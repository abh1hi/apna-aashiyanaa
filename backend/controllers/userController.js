const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get the profile of the currently authenticated user.
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // The user's Firebase UID is attached to the request by the auth middleware.
  // We use this to find the corresponding user in our database.
  const firebaseUid = req.user.uid;

  if (!firebaseUid) {
    res.status(401);
    throw new Error('Not authorized, Firebase UID not found.');
  }

  const user = await User.findByFirebaseUid(firebaseUid);

  if (user) {
    // Return the full user profile stored in our database.
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found in database.');
  }
});

/**
 * @desc    Update the profile of the currently authenticated user.
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const firebaseUid = req.user.uid;

  if (!firebaseUid) {
    res.status(401);
    throw new Error('Not authorized, Firebase UID not found.');
  }

  // First, find the user's document ID based on their Firebase UID.
  const user = await User.findByFirebaseUid(firebaseUid);

  if (user) {
    // Prepare the data for the update.
    // We only allow certain fields to be updated via this endpoint.
    const updateData = {
      name: req.body.name || user.name,
      // Aadhaar can be updated or cleared if sent in the body.
      aadhaar: req.body.aadhaar !== undefined ? req.body.aadhaar.trim() : user.aadhaar,
    };

    // Now, call the update method using the user's actual document ID (_id).
    const updatedUser = await User.update(user._id, updateData);

    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
};
