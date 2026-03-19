// ─── Custom hooks for notes ───────────────────────────────────────────────────
// Wraps TanStack Query calls so components don't import from react-query directly.
// This keeps query keys and data-fetching logic in one place.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, getNote, createNote, updateNote, deleteNote } from '../lib/notes.ts'
import type { Note } from '../types/index.ts'

// ─── Query key factory ────────────────────────────────────────────────────────
// Centralising keys prevents typos and makes invalidation easy.
export const noteKeys = {
  all: ['notes'] as const,
  list: (search?: string) => [...noteKeys.all, 'list', search] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
}

// ─── useNotes: fetch all notes (with optional search) ────────────────────────
export function useNotes(search?: string) {
  return useQuery({
    queryKey: noteKeys.list(search),
    queryFn: () => getNotes(search),
  })
}

// ─── useNote: fetch a single note by id ──────────────────────────────────────
export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNote(id),
    // Don't fetch if id is empty (e.g. on /notes with no note selected)
    enabled: !!id,
  })
}

// ─── useCreateNote ────────────────────────────────────────────────────────────
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Invalidate the list so it refetches and shows the new note
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

// ─── useUpdateNote ────────────────────────────────────────────────────────────
export function useUpdateNote(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Pick<Note, 'title' | 'content'>>) => updateNote(id, data),
    onSuccess: () => {
      // Update both the list and the specific note detail cache
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

// ─── useDeleteNote — with optimistic update ───────────────────────────────────
// Removes the note from the list immediately, before the server confirms.
// Reverts if the delete fails.
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNote,

    // Called before the API request fires
    onMutate: async (deletedId: string) => {
      // Cancel any in-flight refetches (prevents them overwriting our optimistic update)
      await queryClient.cancelQueries({ queryKey: noteKeys.all })

      // Snapshot the current list so we can roll back on error
      const previousNotes = queryClient.getQueryData<Note[]>(noteKeys.list())

      // Optimistically remove the note from the cache
      queryClient.setQueryData<Note[]>(noteKeys.list(), (old) =>
        (old ?? []).filter((note) => note.id !== deletedId)
      )

      // Return snapshot for rollback in onError
      return { previousNotes }
    },

    onError: (_err, _id, context) => {
      // Roll back to the snapshot if the delete failed
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.list(), context.previousNotes)
      }
    },

    onSettled: () => {
      // Always refetch after error or success to make sure server and client are in sync
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}
