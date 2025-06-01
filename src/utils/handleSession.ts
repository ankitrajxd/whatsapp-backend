import { Response } from "express";
import { sign, verify } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function createSession(res: Response, userId: string) {
  // generate a jwt token
  const token = sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60, // 1hr
  });
  // set the token in cookie headers
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax", // or "none" if frontend is on a different domain and using HTTPS
    // secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
    path: "/",
  });
  return;
}

export function verifySession(token: string) {
  try {
    const payload = verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    return {
      success: true,
      message: "Valid session",
      payload,
    };
  } catch (err) {
    return {
      success: false,
      message: "Session expired or invalid",
    };
  }
}
