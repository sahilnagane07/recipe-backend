require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api", require("./routes/commentRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/categoryRoutes"));
app.use("/api", require("./routes/recipeRoutes"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Server running & DB connected ✅");
});

// ✅ 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR ❌", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error ❌",
  });
});

// ✅ Render Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});