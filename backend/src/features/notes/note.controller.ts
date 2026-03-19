import type { Request, Response, NextFunction } from "express";
import { NoteService } from "./note.service.js"; // Import the service
import { ApiError } from "../../utils/apiError.js";
import { z } from "zod";

const GetNotesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  search: z.string().optional(),
  isArchived: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

const CreateNoteSchema = z.object({
  ownerId: z.string(),
  title: z.string().optional().default("Untitled Meeting"),
  content: z.string().optional(),
});

const UpdateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate data from req.body
    const validNote = CreateNoteSchema.parse(req.body);

    // 2. Pass the clean data to the Service layer
    const newNote = await NoteService.createNote(validNote);

    // 3. Return the new database record with a 201 Created status
    res.status(201).json({
      status: "success",
      data: newNote,
    });
  } catch (error) {
    // If Prisma throws an error (e.g. invalid ownerId foreign key constraint), it gets passed to the global handler
    next(error);
  }
};

export const getNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate the incoming query
    // If it fails, Zod throws an error (handled by your error middleware ideally)
    const validQuery = GetNotesQuerySchema.parse(req.query);

    // 2. Use await NoteService.getNotes(...) to fetch the notes
    const notes = await NoteService.getNotes(validQuery);

    // 3. Return the notes array using res.json()
    res.status(200).json({
      status: "success",
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract the note ID from req.params.id
    const noteId = req.params.id;

    if (!noteId || typeof noteId !== "string") {
      throw new ApiError(400, "A valid string noteId is strictly required");
    }

    // 2. Use await NoteService.getNoteById(...) to get the specific note
    const note = await NoteService.getNoteById(noteId);

    // 3. Handle the 404 case if the note is not found (e.g. throw new ApiError(404, "Note not found"))
    if (!note) {
      throw new ApiError(404, "note not found");
    }

    // 4. Return the note using res.json()
    res.status(200).json({
      status: "success",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract the note ID from req.params.id
    const noteId = req.params.id;

    if (!noteId || typeof noteId !== "string") {
      throw new ApiError(400, "A valid string noteId is strictly required");
    }

    // 2. Validate the updated fields from req.body
    const updateData = UpdateNoteSchema.parse(req.body);

    // 3. Use await NoteService.updateNote(...) to modify the database record
    const updatedNote = await NoteService.updateNote(noteId, updateData);

    // 4. Return the updated note via res.json()
    res.status(200).json({
      status: "success",
      data: updatedNote,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract the note ID from req.params.id
    const noteId = req.params.id;

    if (!noteId || typeof noteId !== "string") {
      throw new ApiError(400, "A valid string noteId is strictly required");
    }

    // 2. Use await NoteService.deleteNote(...) to remove it from Postgres
    await NoteService.deleteNote(noteId);

    // 3. Return a success message or a 204 No Content status
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
