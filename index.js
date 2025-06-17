import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.NETLIFY_URL || "http://localhost:5173",
  })
);

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

app.get('/', (req, res) => {
  res.send('Welcome to Full Stack Development!');
});

app.get('/hello', (req, res) => {
  res.send('Life is good!');
});

Lab5(app);           // Lab 5 exercises (PathParameters, QueryParameters, etc.)
UserRoutes(app);     // User authentication (signin, signup, profile)
CourseRoutes(app);   // Course CRUD operations + nested modules/assignments
ModuleRoutes(app);   // Module CRUD operations

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Lab5 exercises available at: http://localhost:${port}/lab5/welcome`);
  console.log(`Kambaz API available at: http://localhost:${port}/api`);
});
