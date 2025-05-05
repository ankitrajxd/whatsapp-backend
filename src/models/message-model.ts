import mongoose, { Schema, Document, Types } from "mongoose";
import { z } from "zod";

interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  timestamp: Date;
  chatId: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  receiverId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: { type: Schema.Types.ObjectId, required: true, ref: "Chat" },
});

// creating model from schema
const Message = mongoose.model<IMessage>("Message", messageSchema);

// function to validate message
function validateMessage(message: IMessage) {
  const schema = z.object({
    senderId: z.string().length(24),
    receiverId: z.string().length(24),
    content: z.string().min(1).max(500),
    timestamp: z.date().optional(),
  });

  const result = schema.safeParse(message);
  if (!result.success) {
    return {
      success: false,
      message: result.error.format(),
    };
  }

  return {
    success: true,
    message: "Validation successful",
  };
}

export { Message, validateMessage };
