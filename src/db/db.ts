import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect(process.env.MONGO_DB_URI!)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
}
