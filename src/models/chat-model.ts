import mongoose, { Schema, Document, Types } from "mongoose";

interface IChat extends Document {
  users: Types.ObjectId[];
  createdAt: Date;
}

const chatSchema = new Schema<IChat>({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create model from schema
const Chat = mongoose.model<IChat>("Chat", chatSchema);

export { Chat };
