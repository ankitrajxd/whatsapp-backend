import mongoose, { Schema, Document } from "mongoose";
import { string, z } from "zod";

export interface UserInput {
  name: string;
  email: string;
  password: string;
}

interface IUser extends Document, UserInput {
  profileImage?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  profileImage: String,
});

// validation function for validating user
function validateUser(user: UserInput) {
  const schema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email().min(5).max(255),
    password: z.string().min(5).max(1024),
  });

  const result = schema.safeParse(user);
  if (!result.success) {
    return {
      success: false,
      message: result.error.errors[0].message,
    };
  }

  return {
    success: true,
    message: "Validation successful",
  };
}




//  Creating model from schema
const User = mongoose.model<IUser>("User", userSchema);

export { User, validateUser, IUser };
