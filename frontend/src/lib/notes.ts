// ─── Note API calls ───────────────────────────────────────────────────────────
// All note-related HTTP calls live here.
// These functions are called by TanStack Query hooks (useQuery / useMutation).

import { apiFetch } from './api.ts'
import type { Note } from '../types/index.ts'

// ─── GET /notes ───────────────────────────────────────────────────────────────
// Fetch all notes for the authenticated user.
// Accepts an optional search query to filter results server-side.
export function getNotes(search?: string): Promise<Note[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<Note[]>(`/notes${query}`)
}

// ─── GET /notes/:id ──────────────────────────────────────────────────────────
export function getNote(id: string): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`)
}

// ─── POST /notes ──────────────────────────────────────────────────────────────
// `Omit` removes server-generated fields — we only send what the user writes.
export function createNote(data: Pick<Note, 'title' | 'content'>): Promise<Note> {
  return apiFetch<Note>('/notes', { method: 'POST', json: data })
}

// ─── PATCH /notes/:id ────────────────────────────────────────────────────────
// Partial update — only send the fields that changed.
export function updateNote(id: string, data: Partial<Pick<Note, 'title' | 'content'>>): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`, { method: 'PATCH', json: data })
}

// ─── DELETE /notes/:id ───────────────────────────────────────────────────────
// Returns void — nothing to parse from a 204 No Content response.
export function deleteNote(id: string): Promise<void> {
  return apiFetch<void>(`/notes/${id}`, { method: 'DELETE' })
}
