require("dotenv").config(); // ✅ load env variables

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// ✅ Connect Database
connectDB();

// ✅ CORS (important for frontend connection)
app.use(cors());

// ✅ Parse JSON
app.use(express.json());

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api", require("./routes/commentRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/categoryRoutes"));
app.use("/api", require("./routes/recipeRoutes"));

// ✅ Health Check Route (for Render)
app.get("/", (req, res) => {
  res.send("Server running & DB connected ✅");
});

// ❌ Handle 404 (very important fix)
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found ❌"
  });
});

// ❌ Global Error Handler (optional but good)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error ❌"
  });
});

// ✅ Use PORT from env (Render requirement)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});