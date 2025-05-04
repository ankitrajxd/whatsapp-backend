import "dotenv/config";
import express from "express";
import { connectDB } from "./db/db";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

try {
  connectDB();
} catch (error) {
  console.error("Failed to connect to the database:", error);
  process.exit(1); // Exit the process if DB connection fails
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
