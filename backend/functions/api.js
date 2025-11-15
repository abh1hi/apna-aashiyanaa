const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app
const app = express();

// CORS configuration - FIXED to include HTTPS localhost
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:5173',  // Added HTTPS support
    'https://localhost:5174',
    'https://apnaashiyanaa-app.web.app'   // Added HTTPS support
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204  // For legacy browser support
};

// Apply CORS middleware FIRST - handles all preflight requests automatically
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Apna Aashiyanaa API'
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/properties', propertyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Export Express app as Cloud Function
// FIXED: Changed region from asia-south1 to us-central1 to match deployment
exports.api = functions.https.onRequest(app);
