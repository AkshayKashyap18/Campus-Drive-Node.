// src/index.js
/**
 * Entry point for Campus Drive Prototype (Node + Express + SQLite/Sequelize).
 * Handles server setup, middleware, and API route mounting.
 */

const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const { sequelize } = require("./models");

const app = express();

// Middleware
app.use(bodyParser.json());

// API Routes
app.use("/api", routes);

// Root endpoint (health check)
app.get("/", (req, res) => {
  res.send("✅ Campus Drive Prototype - Node + SQLite is running");
});

// Port config
const PORT = process.env.PORT || 5000;

// Start server
(async () => {
  try {
    // Ensure DB connection before starting
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Sync models (doesn't drop data; for dev use { force: true } if needed)
    await sequelize.sync();
    console.log("Models synchronized.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();
