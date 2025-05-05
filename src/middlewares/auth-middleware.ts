import { Request, Response, NextFunction } from "express";
import { verifySession } from "../utils/handleSession";

// extending the reques interface
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
    };
  }
}

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

  req.user = { id: result.payload?.userId as string };
  next();
}
