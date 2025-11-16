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

// Trust proxy - required for rate limiting and getting real client IPs
app.set('trust proxy', 1);

// Security: Add security headers (basic implementation without helmet package)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS configuration - production ready
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://localhost:5173",
      "https://localhost:5174",
      "https://apnaashiyanaa-app.web.app",
      "https://apnaashiyanaa-app.firebaseapp.com",
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count", "X-Page-Number"],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Attach request ID to request object
  req.requestId = requestId;
  
  // Log request
  console.log(`[${requestId}] ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Request timeout middleware (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    console.error(`Request timeout: ${req.method} ${req.path}`);
    res.status(408).json({
      success: false,
      error: 'Request timeout',
      message: 'The request took too long to process',
    });
  });
  next();
});

// Health check endpoint with detailed diagnostics
app.get("/health", async (req, res) => {
  try {
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('_healthcheck').doc('test').set({ timestamp: new Date() }, { merge: true });
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Apna Aashiyanaa API",
      version: "2.0.0",
      environment: process.env.NODE_ENV || 'development',
      region: process.env.FIREBASE_REGION || 'us-central1',
      checks: {
        firestore: 'connected',
        auth: 'configured',
        storage: 'configured',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

// Mount API routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);

// API documentation endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Apna Aashiyanaa API",
    version: "2.0.0",
    endpoints: {
      health: "/health",
      auth: "/auth/*",
      users: "/users/*",
      properties: "/properties/*",
    },
    documentation: "https://github.com/abh1hi/apna-aashiyanaa",
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: ['/health', '/auth', '/users', '/properties'],
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error with request context
  console.error('Error occurred:', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.details || null,
    });
  }
  
  if (err.name === 'UnauthorizedError' || err.message.includes('authorized')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required or invalid credentials',
    });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Origin not allowed',
    });
  }
  
  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Export Express app as a 2nd Gen Cloud Function with custom options
exports.api = onRequest(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
    minInstances: 0,
    maxInstances: 10,
    concurrency: 80,
  },
  app
);
