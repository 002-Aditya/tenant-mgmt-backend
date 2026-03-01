const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const getSingleRoutes = require("./routes/getSingle");
const getAllRoutes = require("./routes/getAll");
const errorMiddleware = require("./middlewares/error");

const session = require("express-session");
const setupGoogleAuth = require("./config/googleAuth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for passport body paring if needed

// Session Configuration & Passport SSO
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  }),
);

// Initialize Google Auth configurations and its routes
setupGoogleAuth(app);

// Unauthenticated API Routes
app.use("/api/auth", authRoutes);

// Authenticated separated routes
app.use("/api", postRoutes);
app.use("/api", getAllRoutes);
app.use("/api", getSingleRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Tenant Management API" });
});

// Handle undefined routes
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
