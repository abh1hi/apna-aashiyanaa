const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Basic CORS
app.use(cors({
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// Body parsing - only for non-multipart requests
// Multipart requests (with files) are handled by multer in specific routes
app.use((req, res, next) => {
  // Skip body parsing for multipart/form-data (handled by multer)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next();
  }
  // Parse JSON and URL-encoded bodies for other requests
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ service: "Apna Aashiyanaa API", version: "2.0.0" });
});

// Safely load and mount routes
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/auth", authRoutes);
} catch (e) {
  console.error('Failed to load authRoutes:', e.message);
}

try {
  const userRoutes = require("./routes/userRoutes");
  app.use("/users", userRoutes);
} catch (e) {
  console.error('Failed to load userRoutes:', e.message);
}

try {
  const propertyRoutes = require("./routes/propertyRoutes");
  app.use("/properties", propertyRoutes);
} catch (e) {
  console.error('Failed to load propertyRoutes:', e.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  
  // Handle multer/busboy errors specifically
  if (err.message && err.message.includes('Unexpected end of form')) {
    return res.status(400).json({
      error: 'Invalid form data. The request may be incomplete or corrupted.',
      details: 'Please ensure all form fields are properly formatted and try again.'
    });
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      details: 'Maximum file size is 10MB'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      details: 'Maximum 10 files allowed'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Export function
exports.api = onRequest(
  {
    timeoutSeconds: 120,
    memory: '256MiB',
    minInstances: 0,
    maxInstances: 10,
    concurrency: 80,
    cpu: 2,
  },
  app
);
