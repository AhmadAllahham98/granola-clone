// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Left panel of the notes layout.
// Contains: New Note button, search bar, note list.
//
// State owned here:
//   - `search`: the search input value (local state)
//     (passed to useNotes() which hits GET /notes?search=...)
//
// TODO (Day 11): Wire up useCreateNote() for the New Note button.

import { useState } from 'react'
import { useNotes } from '../../hooks/useNotes.ts'
import NoteList from './NoteList.tsx'

function Sidebar() {
  const [search, setSearch] = useState('')

  // useNotes fetches all notes — passing `search` filters server-side
  const { data: notes, isLoading, isError } = useNotes(search)

  // TODO: Replace console.log with useCreateNote mutation + navigate to new note id
  function handleNewNote() {
    console.log('TODO: create new note')
  }

  return (
    <aside className="flex flex-col h-screen bg-surface border-r border-border overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-semibold text-muted uppercase tracking-widest">
          Granola Notes
        </span>
        <button
          onClick={handleNewNote}
          title="New Note"
          className="w-7 h-7 flex items-center justify-center border border-border rounded text-text hover:bg-surface-alt transition-colors cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <input
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 bg-surface-alt border border-border rounded text-sm text-text outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Note list */}
      {isLoading && <p className="px-4 py-3 text-sm text-muted">Loading...</p>}
      {isError   && <p className="px-4 py-3 text-sm text-danger">Failed to load notes.</p>}
      {notes     && <NoteList notes={notes} />}
    </aside>
  )
}

export default Sidebar
