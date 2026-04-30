const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing in .env ❌");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Error ❌:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;