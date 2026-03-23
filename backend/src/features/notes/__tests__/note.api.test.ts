import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../server.js";
import { NoteService } from "../note.service.js";
import { generateToken } from "../../auth/auth.utils.js";
import { openai } from "../../../utils/ai.js";

// Mock openai
vi.mock("../../../utils/ai.js", () => {
  return {
    openai: {
      responses: {
        create: vi.fn(),
      },
    },
  };
});


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
            id: "d0836797-2640-4b89-81fa-a430e2c74c81",
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
      const mockInput = { title: "New Note", content: "Content here" };
      const mockCreatedNote = {
        id: "f84d82b0-2911-467b-a619-3b46544ae8dd",
        ...mockInput,
        ownerId: mockUserId,
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
      // Trigger zod validation by passing an invalid title type
      const invalidInput = { title: 12345 };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", authHeader)
        .send(invalidInput);

      expect(response.status).toBe(400); 
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should return a specific note by ID", async () => {
      const mockNote = {
        id: "d0836797-2640-4b89-81fa-a430e2c74c81",
        title: "Test Note",
        content: "Hello World",
        ownerId: mockUserId,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(NoteService.getNoteById).mockResolvedValue(mockNote as any);

      const response = await request(app)
        .get("/api/notes/d0836797-2640-4b89-81fa-a430e2c74c81")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.title).toBe("Test Note");
      expect(NoteService.getNoteById).toHaveBeenCalledWith("d0836797-2640-4b89-81fa-a430e2c74c81");
    });

    it("should return 404 if note is not found", async () => {
      vi.mocked(NoteService.getNoteById).mockResolvedValue(null as any);

      const response = await request(app)
        .get("/api/notes/00000000-0000-0000-0000-000000000000")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("note not found");
    });
  });

  describe("PATCH /api/notes/:id", () => {
    it("should update an existing note", async () => {
      const mockUpdatedNote = {
        id: "d0836797-2640-4b89-81fa-a430e2c74c81",
        title: "Updated Title",
        content: "New content",
        ownerId: mockUserId,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(NoteService.updateNote).mockResolvedValue(mockUpdatedNote as any);

      const response = await request(app)
        .patch("/api/notes/d0836797-2640-4b89-81fa-a430e2c74c81")
        .set("Authorization", authHeader)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.title).toBe("Updated Title");
      expect(NoteService.updateNote).toHaveBeenCalledWith("d0836797-2640-4b89-81fa-a430e2c74c81", expect.objectContaining({ title: "Updated Title" }));
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note and return 200", async () => {
      vi.mocked(NoteService.deleteNote).mockResolvedValue({ id: "d0836797-2640-4b89-81fa-a430e2c74c81" } as any);

      const response = await request(app)
        .delete("/api/notes/d0836797-2640-4b89-81fa-a430e2c74c81")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(NoteService.deleteNote).toHaveBeenCalledWith("d0836797-2640-4b89-81fa-a430e2c74c81");
    });
  });

  describe("GET /api/notes/:id/summarize", () => {
    it("should return 404 if note not found", async () => {
      vi.mocked(NoteService.getNoteById).mockResolvedValue(null as any);
      const response = await request(app)
        .get("/api/notes/00000000-0000-0000-0000-000000000000/summarize")
        .set("Authorization", authHeader);
      
      expect(response.status).toBe(404);
    });

    it("should stream the summarized note", async () => {
      const mockNote = {
        id: "d0836797-2640-4b89-81fa-a430e2c74c81",
        title: "Test Note",
        content: "Details regarding X",
      };
      vi.mocked(NoteService.getNoteById).mockResolvedValue(mockNote as any);

      async function* mockStream() {
        yield { type: "response.output_text.delta", delta: "Summary" };
        yield { type: "response.output_text.delta", delta: " text" };
      }
      vi.mocked(openai.responses.create).mockResolvedValue(mockStream() as any);

      const response = await request(app)
        .get("/api/notes/d0836797-2640-4b89-81fa-a430e2c74c81/summarize")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/event-stream");
      expect(response.text).toContain('data: "Summary"\n\n');
      expect(response.text).toContain('data: " text"\n\n');
      expect(response.text).toContain("data: [DONE]\n\n");
      expect(openai.responses.create).toHaveBeenCalled();
    });
  });

  describe("GET /api/notes/:id/action-items", () => {
    it("should return 404 if note not found", async () => {
      vi.mocked(NoteService.getNoteById).mockResolvedValue(null as any);
      const response = await request(app)
        .get("/api/notes/00000000-0000-0000-0000-000000000000/action-items")
        .set("Authorization", authHeader);
      
      expect(response.status).toBe(404);
    });

    it("should stream action items", async () => {
      const mockNote = {
        id: "d0836797-2640-4b89-81fa-a430e2c74c81",
        title: "Test Note",
        content: "Will do X",
      };
      vi.mocked(NoteService.getNoteById).mockResolvedValue(mockNote as any);

      async function* mockStream() {
        yield { type: "response.output_text.delta", delta: "- Action X" };
      }
      vi.mocked(openai.responses.create).mockResolvedValue(mockStream() as any);

      const response = await request(app)
        .get("/api/notes/d0836797-2640-4b89-81fa-a430e2c74c81/action-items")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/event-stream");
      expect(response.text).toContain('data: "- Action X"\n\n');
      expect(response.text).toContain("data: [DONE]\n\n");
      expect(openai.responses.create).toHaveBeenCalled();
    });
  });
});
