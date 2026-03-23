import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import noteRoutes from "./features/notes/note.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

/**
 * MISSION 0: CORS
 * Goal: Allow requests from other origins (like your frontend).
 */
app.use(cors()); 

app.use(express.json()); // Built-in middleware to parse JSON bodies

/**
 * MISSION 1: THE LOGGER
 * Goal: Log the current time and the requested URL for every single request.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

/**
 * MISSION 2.5: THE HEALTH CHECK
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

/**
 * MISSION 2.75: THE AUTH API
 */
app.use("/api/auth", authRoutes);

/**
 * MISSION 6: THE NOTES API
 */
app.use("/api/notes", noteRoutes);

/**
 * MISSION 3: THE TRANSCRIPT ROUTE
 */
app.get("/transcript/:id", (req: Request, res: Response) => {
  return res.status(200).json({
    id: req.params.id,
    transcript: "this is a note",
  });
});

/**
 * MISSION 4: THE ERROR TRIGGER
 */
app.get("/crash", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(500, "Oops, something went kaboom! 💥"));
});

/**
 * MISSION 4.5: THE 404 HANDLER
 * If no route matched, it ends up here.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

/**
 * MISSION 5: THE GLOBAL ERROR HANDLER
 * Goal: A "Catch-All" function that formats errors into nice JSON.
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Intercept Zod Validation Errors
  if (err.name === "ZodError") {
    res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: (err.issues || err.errors || []).map((e: any) => ({
        field: e.path ? e.path.join('.') : 'unknown',
        message: e.message
      }))
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // only show stack in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Granola-Lite Server running at http://localhost:${PORT}`);
  });
}

export default app;
