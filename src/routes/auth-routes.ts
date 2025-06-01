import { Router } from "express";
import { User } from "../models/user-model";
import { z } from "zod";
import { checkPassword, hashPassword } from "../utils/hashPassword";
import { createSession } from "../utils/handleSession";

const authRouter = Router();

export interface LoginInput {
  email: string;
  password: string;
}

authRouter.post("/login", async (req, res) => {
  //  parse the req body and get the credentials
  const user: LoginInput = req.body;
  const result = validateLogin(user);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  // check db for the user
  const existingUser = await User.findOne({
    email: user.email,
  });

  if (!existingUser) {
    res.status(400).json({
      success: false,
      message: "Incorrect email or password.",
    });
    return;
  }

  // check the password
  const isCorrect = await checkPassword(user.password, existingUser.password);

  if (!isCorrect) {
    res.status(400).json({
      success: false,
      message: "Incorrect email or password.",
    });
    return;
  }

  // create session
  createSession(res, existingUser?.id);
  res.status(200).json({
    success: true,
    message: "Login successful",
  });
  return;
});

authRouter.post("/logout", async (req, res) => {
  // clear the session
  res.clearCookie("session", {
    httpOnly: true,
    sameSite: "lax", // or "none" if using "none" above
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
  return;
});

function validateLogin(user: LoginInput) {
  const schema = z.object({
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

function validateSignup(user: SignupInput) {
  const schema = z.object({
    email: z.string().email().min(5).max(255),
    name: z.string().min(1).max(255),
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

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

authRouter.post("/signup", async (req, res) => {
  const user: SignupInput = req.body;
  const isValid = validateSignup(user);
  if (!isValid.success) {
    res.status(400).json({
      success: false,
      message: isValid.message,
    });
    return;
  }

  // check for existing user
  const existingUser = await User.findOne({
    email: user.email,
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      message: "User with this email already exists.",
    });
    return;
  }

  // hash the password
  const hashedPassword = await hashPassword(user.password);
  if (!hashedPassword) {
    res.status(500).json({
      success: false,
      message: "Failed to hash password.",
    });
    return;
  }

  // create the user
  const newUser = new User({
    email: user.email,
    name: user.name,
    password: hashedPassword,
    profileImage:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  });

  await newUser.save();

  // create session
  createSession(res, newUser.id);

  res.status(201).json({
    success: true,
    message: "User created successfully",
  });
});

export { authRouter };
