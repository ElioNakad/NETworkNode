const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/fypdb");

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

module.exports = connectMongo;