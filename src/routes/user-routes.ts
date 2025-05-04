import { Router } from "express";
import { User, UserInput, validateUser } from "../models/user-model";
import { hashPassword } from "../utils/hashPassword";
import { createSession } from "../utils/handleSession";

const userRouter = Router();

// signup router
userRouter.post("/", async (req, res) => {
  const user: UserInput = req.body;

  const result = validateUser(user);
  if (!result.success) {
    res.json({
      success: false,
      message: result.message,
    });
    return;
  }

  //   check if the user exists in db
  const existingUser = await User.findOne({
    email: user.email,
  });

  if (existingUser) {
    res.json({
      success: false,
      messsage: "Email already registered.",
    });
    return;
  }

  //  hash the password with bcrypt
  const hashedPassword = await hashPassword(user.password);

  //  save the user in db
  const newUser = new User({
    name: user.name,
    email: user.email,
    password: hashedPassword,
  });

  await newUser.save();
  createSession(res, newUser.id);
  res.send("User created successfully");
  return;
});

export { userRouter };
