import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../server.js";
import { prisma } from "../../../utils/prisma.js";
import bcrypt from "bcrypt";

vi.mock("../../../utils/prisma.js", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        fullName: "Test User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.user.id).toBe("user-123");
      expect(response.body.token).toBeDefined();
    });

    it("should return 409 if user already exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-existing",
        email: "test@example.com",
      } as any);

      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("User with this email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user with correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password: hashedPassword,
        fullName: "Test User",
      } as any);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 for invalid password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password: hashedPassword,
        fullName: "Test User",
      } as any);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});
