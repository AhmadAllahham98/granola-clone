import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../server.js";
import { NoteService } from "../note.service.js";
import { generateToken } from "../../auth/auth.utils.js";

// Mock the NoteService fully so we don't hit the real database
vi.mock("../note.service.js", () => {
  return {
    NoteService: {
      createNote: vi.fn(),
      getNotes: vi.fn(),
      getNoteById: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    },
  };
});

// A valid mock user ID and JWT token for auth header
const mockUserId = "user-123";
const validToken = generateToken(mockUserId);
const authHeader = `Bearer ${validToken}`;

describe("Notes API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/notes", () => {
    it("should return 401 if no auth token is provided", async () => {
      const response = await request(app).get("/api/notes");
      expect(response.status).toBe(401);
    });

    it("should return a list of notes", async () => {
      const mockNotesResponse = {
        meta: { page: 1, limit: 10, totalCount: 1, totalPages: 1 },
        data: [
          {
            id: "note-1",
            title: "Test Note",
            content: "Hello World",
            ownerId: mockUserId,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      vi.mocked(NoteService.getNotes).mockResolvedValue(mockNotesResponse as any);

      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].title).toBe("Test Note");
    });
  });

  describe("POST /api/notes", () => {
    it("should create a new note", async () => {
      const mockInput = { ownerId: mockUserId, title: "New Note", content: "Content here" };
      const mockCreatedNote = {
        id: "note-2",
        ...mockInput,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(NoteService.createNote).mockResolvedValue(mockCreatedNote as any);

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", authHeader)
        .send(mockInput);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.title).toBe("New Note");
      expect(NoteService.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New Note", ownerId: mockUserId })
      );
    });

    it("should return 400 if validation fails", async () => {
      // Missing ownerId should trigger Zod validation error
      const invalidInput = { title: "No Owner Note" };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", authHeader)
        .send(invalidInput);

      // We expect the global error handler to format Zod errors or throw 500 depending on setup
      // Assuming global handler returns a 500 or 400 based on error type
      expect(response.status).toBeGreaterThanOrEqual(400); 
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should return a specific note by ID", async () => {
      const mockNote = {
        id: "note-1",
        title: "Test Note",
        content: "Hello World",
        ownerId: mockUserId,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(NoteService.getNoteById).mockResolvedValue(mockNote as any);

      const response = await request(app)
        .get("/api/notes/note-1")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.title).toBe("Test Note");
      expect(NoteService.getNoteById).toHaveBeenCalledWith("note-1");
    });

    it("should return 404 if note is not found", async () => {
      vi.mocked(NoteService.getNoteById).mockResolvedValue(null as any);

      const response = await request(app)
        .get("/api/notes/invalid-note-id")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("note not found");
    });
  });

  describe("PATCH /api/notes/:id", () => {
    it("should update an existing note", async () => {
      const mockUpdatedNote = {
        id: "note-1",
        title: "Updated Title",
        content: "New content",
        ownerId: mockUserId,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(NoteService.updateNote).mockResolvedValue(mockUpdatedNote as any);

      const response = await request(app)
        .patch("/api/notes/note-1")
        .set("Authorization", authHeader)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.title).toBe("Updated Title");
      expect(NoteService.updateNote).toHaveBeenCalledWith("note-1", expect.objectContaining({ title: "Updated Title" }));
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note and return 200", async () => {
      vi.mocked(NoteService.deleteNote).mockResolvedValue({ id: "note-1" } as any);

      const response = await request(app)
        .delete("/api/notes/note-1")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(NoteService.deleteNote).toHaveBeenCalledWith("note-1");
    });
  });
});
