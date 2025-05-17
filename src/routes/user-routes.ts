import { Router } from "express";
import { User, UserInput, validateUser } from "../models/user-model";
import { hashPassword } from "../utils/hashPassword";
import { createSession } from "../utils/handleSession";
import { authMiddleware } from "../middlewares/auth-middleware";

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
    profileImage:
      user.profileImage ||
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  });

  await newUser.save();
  createSession(res, newUser.id);
  res.send("User created successfully");
  return;
});

//====================================================================

// get current user
userRouter.get("/me", authMiddleware, async (req, res) => {
  // get the user from db

  const user = await User.findOne({
    _id: req.user?.id,
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User Not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    },
  });
});

//====================================================================

//  get all users or contacts
userRouter.get("/", authMiddleware, async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user?.id },
  }).select("-password -__v");

  res.status(200).json({
    success: true,
    message: users,
  });
});

export { userRouter };

//====================================================================
// get a user by id
userRouter.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -__v");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User Not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
