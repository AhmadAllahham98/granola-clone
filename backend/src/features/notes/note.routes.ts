import express from "express";
import { 
  getNotes, 
  createNote, 
  getNoteById, 
  updateNote, 
  deleteNote 
} from "./note.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = express.Router();

// Map HTTP methods to your controller methods:

// GET / -> getNotes
router.get("/", authenticate, getNotes);

// GET /:id -> getNoteById
router.get("/:id", authenticate, getNoteById);

// POST / -> createNote (validation is handled inside the controller via Zod)
router.post("/", authenticate, createNote);

// PATCH /:id -> updateNote (Use PATCH for partial updates, PUT for full replacement)
router.patch("/:id", authenticate, updateNote);

// DELETE /:id -> deleteNote
router.delete("/:id", authenticate, deleteNote);

export default router;
