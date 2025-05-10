import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { Chat } from "../models/chat-model";
import { Message } from "../models/message-model";

const chatRouter = Router();

//====================================================================

//  find a chat
chatRouter.post("/", authMiddleware, async (req, res) => {
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
// create a new chat
chatRouter.post("/new", authMiddleware, async (req, res) => {
  const { otherUser } = req.body;

  const chat = new Chat({
    users: [req.user?.id, otherUser],
    createdAt: Date.now(),
  });

  await chat.save();
  res.status(201).json({
    success: true,
    data: chat,
  });
});

//====================================================================
// send a message
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

// get all messages for a chat
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

// get all chats for a user
chatRouter.get("/all", authMiddleware, async (req, res) => {
  const chats = await Chat.find({ users: req.user?.id });
  res.status(200).json({ success: true, data: chats });
});

//====================================================================
// get chat details by chatid

chatRouter.get("/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  const result = await Chat.findOne({
    _id: chatId,
  });
  if (!result) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }
  // filter the chat to exclude the current user and return the other user
  const otherUser = result?.users.filter(
    (user) => user.toString() !== req.user?.id
  )[0];

  res.status(200).json({
    success: true,
    message: otherUser,
  });
});

//====================================================================
// delete a chat route

chatRouter.delete("/delete/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  const result = await Chat.findOneAndDelete({
    _id: chatId,
  });
  if (!result) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Chat deleted successfully.",
  });
  return;
});

//====================================================================
