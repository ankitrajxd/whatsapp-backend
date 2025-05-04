import "dotenv/config";
import express from "express";
import { connectDB } from "./db/db";
import { userRouter } from "./routes/user-routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth-routes";
import { authMiddleware } from "./middlewares/auth-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

try {
  connectDB();
} catch (error) {
  console.error("Failed to connect to the database:", error);
  process.exit(1); // Exit the process if DB connection fails
}

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You can access this protected route.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
