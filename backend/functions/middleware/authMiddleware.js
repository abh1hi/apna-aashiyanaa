const admin = require('firebase-admin');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let idToken;

  // Check for Firebase ID token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Get token from header
      idToken = req.headers.authorization.split(' ')[1];

      // Verify the ID token using the Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // The decoded token has a 'uid' property which is the Firebase UID
      const firebaseUid = decodedToken.uid;

      // Find the user in our own database using their Firebase UID
      const user = await User.findByFirebaseUid(firebaseUid);

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found in our database.');
      }

      // Attach the user object from our database to the request object
      req.user = user;

      next(); // Proceed to the next middleware or the route handler
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      res.status(401);
      throw new Error('Not authorized. Token verification failed.');
    }
  } else {
    // If there is no token or the header is not in the 'Bearer' format
    res.status(401);
    throw new Error('Not authorized, no token provided.');
  }
});

module.exports = { protect };
