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
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";


const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING);


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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 👈 NEW: DEBUG ROUTES FOR MONGODB
app.get('/api/debug/mongodb/:collection?', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { collection } = req.params;
    
    if (collection) {
      // Get specific collection
      const data = await db.collection(collection).find({}).toArray();
      res.json({
        message: `MongoDB collection: ${collection}`,
        database: 'kambaz',
        count: data.length,
        data: data
      });
    } else {
      // List all collections
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      res.json({
        message: 'Available MongoDB collections',
        database: 'kambaz',
        collections: collectionNames,
        usage: [
          'GET /api/debug/mongodb - List all collections',
          'GET /api/debug/mongodb/quizzes - View quiz data',
          'GET /api/debug/mongodb/users - View user data',
          'GET /api/debug/mongodb/courses - View course data',
          'GET /api/debug/mongodb/modules - View module data',
          'GET /api/debug/mongodb/enrollments - View enrollment data',
          'GET /api/debug/mongodb/assignments - View assignment data'
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch MongoDB data', 
      details: error.message 
    });
  }
});

// TEMPORARY ROUTE TO POPULATE TEST DATA (including quiz test data)
app.get('/api/populate-test-data', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    await db.collection('users').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('modules').deleteMany({});
    await db.collection('enrollments').deleteMany({});

    // Create test users
    const testUsers = [
      {
        _id: 'user-alice-123',
        username: 'alice',
        password: 'alice123',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@northeastern.edu',
        role: 'STUDENT',
        section: 'S101',
        loginId: '001234561S'
      },
      {
        _id: 'user-bob-456',
        username: 'bob',
        password: 'bob123',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@northeastern.edu',
        role: 'FACULTY',
        section: 'S101',
        loginId: '001234562F'
      },
      {
        _id: 'user-charlie-789',
        username: 'charlie',
        password: 'charlie123',
        firstName: 'Charlie',
        lastName: 'Wilson',
        email: 'charlie@northeastern.edu',
        role: 'ADMIN',
        section: 'S101',
        loginId: '001234563A'
      }
    ];

    const userResult = await db.collection('users').insertMany(testUsers);
    
    // Create test courses
    const testCourses = [
      {
        _id: 'course-cs5610',
        name: 'Web Development',
        number: 'CS5610',
        credits: 4,
        description: 'Learn modern web development with React, Node.js, and MongoDB'
      },
      {
        _id: 'course-cs5500',
        name: 'Software Engineering',
        number: 'CS5500',
        credits: 4,
        description: 'Software engineering principles and practices'
      },
      {
        _id: 'course-cs5800',
        name: 'Algorithms',
        number: 'CS5800',
        credits: 4,
        description: 'Design and analysis of algorithms'
      }
    ];

    const courseResult = await db.collection('courses').insertMany(testCourses);

    // Create test modules
    const testModules = [
      {
        _id: 'module-react-101',
        name: 'Introduction to React',
        description: 'Learn the basics of React components, state, and props',
        course: 'course-cs5610'
      },
      {
        _id: 'module-node-101',
        name: 'Node.js Fundamentals',
        description: 'Server-side JavaScript with Node.js and Express',
        course: 'course-cs5610'
      },
      {
        _id: 'module-mongo-101',
        name: 'MongoDB Basics',
        description: 'NoSQL database fundamentals with MongoDB',
        course: 'course-cs5610'
      },
      {
        _id: 'module-testing-101',
        name: 'Software Testing',
        description: 'Unit testing, integration testing, and test-driven development',
        course: 'course-cs5500'
      },
      {
        _id: 'module-sorting-101',
        name: 'Sorting Algorithms',
        description: 'Bubble sort, merge sort, quick sort, and their analysis',
        course: 'course-cs5800'
      }
    ];

    const moduleResult = await db.collection('modules').insertMany(testModules);

    // Create test enrollments
    const testEnrollments = [
      {
        _id: 'enroll-alice-cs5610',
        user: 'user-alice-123',
        course: 'course-cs5610',
        status: 'ENROLLED',
        enrollmentDate: new Date()
      },
      {
        _id: 'enroll-alice-cs5500',
        user: 'user-alice-123',
        course: 'course-cs5500',
        status: 'ENROLLED',
        enrollmentDate: new Date()
      },
      {
        _id: 'enroll-bob-cs5610',
        user: 'user-bob-456',
        course: 'course-cs5610',
        status: 'ENROLLED',
        enrollmentDate: new Date()
      },
      {
        _id: 'enroll-charlie-all',
        user: 'user-charlie-789',
        course: 'course-cs5610',
        status: 'ENROLLED',
        enrollmentDate: new Date()
      }
    ];

    const enrollmentResult = await db.collection('enrollments').insertMany(testEnrollments);

    res.json({
      message: 'Test data populated successfully! 🎉',
      summary: {
        users: `${userResult.insertedCount} users created`,
        courses: `${courseResult.insertedCount} courses created`,
        modules: `${moduleResult.insertedCount} modules created`,
        enrollments: `${enrollmentResult.insertedCount} enrollments created`
      },
      testAccounts: {
        student: { username: 'alice', password: 'alice123', role: 'STUDENT' },
        faculty: { username: 'bob', password: 'bob123', role: 'FACULTY' },
        admin: { username: 'charlie', password: 'charlie123', role: 'ADMIN' }
      },
      nextSteps: [
        'Visit /api/debug/mongodb to see all collections',
        'Visit /api/debug/mongodb/users to see user data',
        'Visit /api/debug/mongodb/courses to see course data',
        'Visit /api/debug/mongodb/quizzes to see quiz data',
        'Visit /api/quizzes/test to test quiz routes',
        'Try signing up/signing in with the test accounts',
        'Test course enrollment functionality'
      ]
    });

  } catch (error) {
    console.error('Error populating test data:', error);
    res.status(500).json({ 
      error: 'Failed to populate test data', 
      details: error.message 
    });
  }
});

// ROUTE TO CLEAR ALL DATA (for testing)
app.get('/api/clear-all-data', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    await db.collection('users').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('modules').deleteMany({});
    await db.collection('enrollments').deleteMany({});
    await db.collection('quizzes').deleteMany({});

    res.json({
      message: 'All data cleared successfully! 🧹',
      note: 'You can repopulate with /api/populate-test-data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
Lab5(app);           // Lab 5 exercises (PathParameters, QueryParameters, etc.)
UserRoutes(app);     // User authentication (signin, signup, profile)
CourseRoutes(app);   // Course CRUD operations + nested modules/assignments
ModuleRoutes(app);   // Module CRUD operations
EnrollmentRoutes(app); // Enrollment operations
AssignmentRoutes(app); //Assignment operations
QuizRoutes(app);     // Quiz operations

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Lab5 exercises available at: http://localhost:${port}/lab5/welcome`);
  console.log(`Kambaz API available at: http://localhost:${port}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`NETLIFY_URL: ${process.env.NETLIFY_URL || 'not set'}`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}`);
  console.log(`\n🧪 Test routes:`);
  console.log(`   Populate data: http://localhost:${port}/api/populate-test-data`);
  console.log(`   Clear data: http://localhost:${port}/api/clear-all-data`);
  console.log(`   Quiz routes test: http://localhost:${port}/api/quizzes/test`);
  console.log(`   MongoDB debug: http://localhost:${port}/api/debug/mongodb`);
  console.log(`   View users: http://localhost:${port}/api/debug/mongodb/users`);
  console.log(`   View quizzes: http://localhost:${port}/api/debug/mongodb/quizzes`);
});
