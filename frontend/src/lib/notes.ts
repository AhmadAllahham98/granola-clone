// ─── Note API calls ───────────────────────────────────────────────────────────
// All note-related HTTP calls live here.
// These functions are called by TanStack Query hooks (useQuery / useMutation).

import { apiFetch } from './api.ts'
import type { Note, ActionItem } from '../types/index.ts'

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface PaginatedData<T> {
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  data: T[];
}

// ─── GET /notes ───────────────────────────────────────────────────────────────
// Fetch all notes for the authenticated user.
// Accepts an optional search query to filter results server-side.
export async function getNotes(search?: string): Promise<Note[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  const response = await apiFetch<ApiResponse<PaginatedData<Note>>>(`/api/notes${query}`)
  // The backend wraps lists in { data: { data: [] } } due to pagination meta
  return response.data.data;
}

// ─── GET /notes/:id ──────────────────────────────────────────────────────────
export async function getNote(id: string): Promise<Note> {
  const response = await apiFetch<ApiResponse<Note>>(`/api/notes/${id}`)
  return response.data;
}

// ─── POST /notes ──────────────────────────────────────────────────────────────
// `Omit` removes server-generated fields — we only send what the user writes.
export async function createNote(data: Pick<Note, 'title' | 'content'>): Promise<Note> {
  const response = await apiFetch<ApiResponse<Note>>('/api/notes', { method: 'POST', json: data })
  return response.data;
}

// ─── PATCH /notes/:id ────────────────────────────────────────────────────────
// Partial update — only send the fields that changed.
export async function updateNote(id: string, data: Partial<Pick<Note, 'title' | 'content'>>): Promise<Note> {
  const response = await apiFetch<ApiResponse<Note>>(`/api/notes/${id}`, { method: 'PATCH', json: data })
  return response.data;
}

// ─── DELETE /notes/:id ───────────────────────────────────────────────────────
// Returns void — nothing to parse from a 204 No Content response.
export async function deleteNote(id: string): Promise<void> {
  await apiFetch<void>(`/api/notes/${id}`, { method: 'DELETE' })
}

// ─── ACTION ITEMS ─────────────────────────────────────────────────────────────

export async function createActionItems(noteId: string, descriptions: string[]): Promise<ActionItem[]> {
  const response = await apiFetch<ApiResponse<ActionItem[]>>(`/api/notes/${noteId}/action-items`, { method: 'POST', json: { descriptions } })
  return response.data;
}

export async function updateActionItem(id: string, isCompleted: boolean): Promise<ActionItem> {
  const response = await apiFetch<ApiResponse<ActionItem>>(`/api/notes/action-items/${id}`, { method: 'PATCH', json: { isCompleted } })
  return response.data;
}

export async function deleteActionItem(id: string): Promise<void> {
  await apiFetch<void>(`/api/notes/action-items/${id}`, { method: 'DELETE' })
}
