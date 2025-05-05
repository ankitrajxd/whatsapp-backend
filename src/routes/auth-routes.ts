import { Router } from "express";
import { User } from "../models/user-model";
import { z } from "zod";
import { checkPassword } from "../utils/hashPassword";
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

export { authRouter };
