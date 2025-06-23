import "dotenv/config";
import express from "express";
import mongoose from "mongoose"; 
import session from "express-session";
import cors from "cors";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

// Connect to MongoDB - ADD THIS SECTION
const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING);

// Log MongoDB connection status
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ Disconnected from MongoDB');
});

const app = express();

// CORS configuration - FIXED to allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4000',
  process.env.NETLIFY_URL,
  'https://kambaz-node.onrender.com'
].filter(Boolean); // Remove undefined values

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ]
  })
);

// Handle preflight requests
app.options('*', cors());

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}

app.use(session(sessionOptions));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Full Stack Development!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    allowedOrigins: allowedOrigins,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'  // ADD THIS LINE
  });
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Life is good!' });
});

// Test route for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    session: req.session ? 'active' : 'inactive',
    origin: req.get('origin') || 'no-origin',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'  // ADD THIS LINE
  });
});

// Routes
Lab5(app);           // Lab 5 exercises (PathParameters, QueryParameters, etc.)
UserRoutes(app);     // User authentication (signin, signup, profile)
CourseRoutes(app);   // Course CRUD operations + nested modules/assignments
ModuleRoutes(app);   // Module CRUD operations
EnrollmentRoutes(app); // Enrollment operations

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Lab5 exercises available at: http://localhost:${port}/lab5/welcome`);
  console.log(`Kambaz API available at: http://localhost:${port}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`NETLIFY_URL: ${process.env.NETLIFY_URL || 'not set'}`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}`);
});
