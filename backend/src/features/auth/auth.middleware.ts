import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils.js";

// Extend Express Request type to include your custom property
export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }

  // Attach the user ID to the request object
  req.userId = decoded.userId;
  next();
};
