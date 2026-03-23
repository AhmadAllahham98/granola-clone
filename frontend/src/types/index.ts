// ─── Shared TypeScript types ──────────────────────────────────────────────────
// These mirror the shapes returned by the backend API.
// Import from this file throughout the app — never duplicate type definitions.

export type User = {
  id: string
  email: string
}

export type ActionItem = {
  id: string
  noteId: string
  description: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type Note = {
  id: string
  title: string
  content: string
  createdAt: string   // ISO 8601 string, e.g. "2024-03-19T12:00:00Z"
  updatedAt: string
  userId: string
  actionItems?: ActionItem[]
}

// Shape of the JSON body returned by POST /auth/login and POST /auth/register
export type AuthResponse = {
  token: string
  user: User
}

// Generic API error shape — match whatever your backend sends back
export type ApiError = {
  message: string
  status: number
}

// ─── Convenience union ────────────────────────────────────────────────────────
// Useful when a function can return data OR an error
export type Result<T> = { data: T; error: null } | { data: null; error: ApiError }
