import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import Lab5 from "./Lab5/index.js";

const app = express();

// CORS configuration
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

// Basic routes
app.get('/', (req, res) => {
  res.send('Welcome to Full Stack Development!');
});

app.get('/hello', (req, res) => {
  res.send('Life is good!');
});

// Lab5 routes
Lab5(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});