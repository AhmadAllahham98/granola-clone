import type { Request, Response, NextFunction } from "express";
import { NoteService } from "./note.service.js"; // Import the service
import { ApiError } from "../../utils/apiError.js";
import { z } from "zod";
import { openai } from "../../utils/ai.js";

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
  title: z.string().optional().default("Untitled Meeting"),
  content: z.string().optional(),
});

const UpdateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  isArchived: z.boolean().optional(),
});

const CreateActionItemsSchema = z.object({
  descriptions: z.array(z.string()).min(1),
});

const UpdateActionItemSchema = z.object({
  isCompleted: z.boolean(),
});

const UuidSchema = z.string().uuid("A valid UUID noteId is strictly required");

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate data from req.body
    const validBody = CreateNoteSchema.parse(req.body);
    
    // IMPORTANT: Get ownerId securely from the JWT token via middleware!
    const ownerId = (req as any).userId;
    
    if (!ownerId) {
      throw new ApiError(401, "Unauthorized");
    }

    const validNote = {
      ...validBody,
      ownerId
    };

    // 2. Pass the clean data to the Service layer
    const newNote = await NoteService.createNote(validNote as any);

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
    // 1. Extract and validate the note ID from req.params.id
    const noteId = UuidSchema.parse(req.params.id);

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
    // 1. Extract and validate the note ID from req.params.id
    const noteId = UuidSchema.parse(req.params.id);

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
    // 1. Extract and validate the note ID from req.params.id
    const noteId = UuidSchema.parse(req.params.id);

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

export const summarizeNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const noteId = UuidSchema.parse(req.params.id);
    const note = await NoteService.getNoteById(noteId);

    if (!note) {
      throw new ApiError(404, "note not found");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await openai.responses.create({
      model: "gpt-4o",
      stream: true,
      instructions: "You are an AI assistant. Provide a concise, well-structured summary of these meeting notes.",
      input: `Title: ${note.title}\n\nContent: ${note.content || ""}`
    });

    for await (const chunk of stream) {
      if (chunk.type === "response.output_text.delta") {
        const content = chunk.delta;
        if (content) {
          res.write(`data: ${JSON.stringify(content)}\n\n`);
        }
      }
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error in summarizeNote:", error);
    if (!res.headersSent) {
      next(error);
    } else {
      const errorMessage = error?.message || "Internal server error during streaming.";
      res.write(`data: ${JSON.stringify(`\n[Error: ${errorMessage}]`)}\n\n`);
      res.end();
    }
  }
};

export const extractActionItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const noteId = UuidSchema.parse(req.params.id);
    const note = await NoteService.getNoteById(noteId);

    if (!note) {
      throw new ApiError(404, "note not found");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await openai.responses.create({
      model: "gpt-4o",
      stream: true,
      instructions: "You are an AI assistant. Extract clear, actionable items from the given meeting notes. Present them as a bulleted checklist.",
      input: `Title: ${note.title}\n\nContent: ${note.content || ""}`
    });

    for await (const chunk of stream) {
      if (chunk.type === "response.output_text.delta") {
        const content = chunk.delta;
        if (content) {
          res.write(`data: ${JSON.stringify(content)}\n\n`);
        }
      }
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error in extractActionItems:", error);
    if (!res.headersSent) {
      next(error);
    } else {
      const errorMessage = error?.message || "Internal server error during streaming.";
      res.write(`data: ${JSON.stringify(`\n[Error: ${errorMessage}]`)}\n\n`);
      res.end();
    }
  }
};

export const createActionItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const noteId = UuidSchema.parse(req.params.id);
    const validBody = CreateActionItemsSchema.parse(req.body);

    const actionItems = await NoteService.createActionItems(noteId, validBody.descriptions);

    res.status(201).json({
      status: "success",
      data: actionItems,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActionItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actionItemId = UuidSchema.parse(req.params.id);
    const validBody = UpdateActionItemSchema.parse(req.body);

    const updatedItem = await NoteService.updateActionItem(actionItemId, validBody.isCompleted);

    res.status(200).json({
      status: "success",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActionItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actionItemId = UuidSchema.parse(req.params.id);
    await NoteService.deleteActionItem(actionItemId);

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
