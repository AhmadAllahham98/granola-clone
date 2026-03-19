import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/apiError.js";

/**
 * A simple validation middleware that checks if required fields are in the body.
 * This is a "Day 6" version. We will use Zod on Day 9!
 */
export const validateNote = (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title || typeof title !== "string") {
    return next(new ApiError(400, "Title is required and must be a string"));
  }

  if (!content || typeof content !== "string") {
    return next(new ApiError(400, "Content is required and must be a string"));
  }

  next();
};
