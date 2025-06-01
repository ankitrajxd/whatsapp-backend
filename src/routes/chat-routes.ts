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
    const io = req.app.get("io");
    io.to(chatId).emit("newMessage", newMessage);

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

  const chat = await Chat.findOne({ _id: chatId, users: req.user?.id });
  if (!chat) {
    res
      .status(403)
      .json({ message: "Forbidden: You do not have access to this chat." });
    return;
  }

  try {
    const messages = await Message.find({
      chatId,
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
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
    data: otherUser,
  });
});

//====================================================================
// delete a chat

chatRouter.delete("/delete/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, users: req.user?.id });
  if (!chat) {
    res
      .status(403)
      .json({ message: "Forbidden: You do not have access to this chat." });
    return;
  }

  const result = await Chat.findOneAndDelete({
    _id: chatId,
  });

  //  also delete all the messages related to that chat
  const deletemsgResult = await Message.deleteMany({
    chatId,
  });

  if (!result || !deletemsgResult) {
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

// clear a chat

chatRouter.delete("/clear/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  const result = await Message.deleteMany({
    chatId,
  });

  if (!result) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Chat cleared successfully.",
  });
  return;
});

// get the last message of a chat
chatRouter.get("/lastmessage/:chatId", authMiddleware, async (req, res) => {
  const { chatId } = req.params;

  const result = await Message.findOne({
    chatId,
  })
    .sort({ timestamp: -1 })
    .limit(1);
  if (!result) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }
  res.status(200).json({
    success: true,
    data: result,
  });
  return;
});

// get the last active time of a user from messages
chatRouter.get("/lastactive/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  const result = await Message.findOne({
    senderId: userId,
  });

  if (!result) {
    res.status(404).json({ message: "Message not found." });
    return;
  }
  res.status(200).json({
    success: true,
    data: result,
  });
});
