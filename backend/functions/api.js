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

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
