import "dotenv/config";
import express from "express";
import { connectDB } from "./db/db";
import { userRouter } from "./routes/user-routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth-routes";
import { authMiddleware } from "./middlewares/auth-middleware";
import { chatRouter } from "./routes/chat-routes";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
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

app.set("io", io);

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/chats", chatRouter);

app.get("/protected", authMiddleware, (_req, res) => {
  res.status(200).json({
    message: "You can access this protected route.",
  });
});

// Socket.IO connection handler (optional, for joining rooms)
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
