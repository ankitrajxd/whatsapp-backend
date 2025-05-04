import { Request, Response, NextFunction } from "express";
import { verifySession } from "../utils/handleSession";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.session;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const result = verifySession(token);
  if (!result.success) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  next();
}
