import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { Chat } from "../models/chat-model";
import { Message } from "../models/message-model";

const chatRouter = Router();

//====================================================================

chatRouter.post("/", authMiddleware, async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    res.status(400).json({ message: "Users array is required." });
    return;
  }

  const chat = new Chat({
    users: users,
    createdAt: Date.now(),
  });

  await chat.save();
  res.status(201).json({
    success: true,
    data: chat,
  });
});

//====================================================================

//  find a chat
chatRouter.get("/", authMiddleware, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user?.id;

  const chat = await Chat.findOne({
    users: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }

  res.status(200).json({ success: true, data: chat });
});

//====================================================================

chatRouter.post("/:chatId/messages", authMiddleware, async (req, res) => {
  const { chatId } = req.params;
  let sender = req.user?.id;
  const { message, reciever } = req.body;

  try {
    // save the message

    const newMessage = new Message({
      chatId,
      senderId: sender,
      receiverId: reciever,
      content: message,
      timestamp: Date.now(),
    });

    await newMessage.save();
    // todo: implement realtime feature here
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send message.", success: false });
    return;
  }
});

//====================================================================

chatRouter.get("/:chatId/messages", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({
      chatId,
    });

    res.json(messages);
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "No messages found",
    });
    return;
  }
});

export { chatRouter };

//====================================================================
