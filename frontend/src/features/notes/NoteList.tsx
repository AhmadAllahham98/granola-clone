// ─── NoteList ─────────────────────────────────────────────────────────────────
// Renders the scrollable list of notes in the sidebar.
// Maps over the notes array and renders a NoteListItem for each.
//
// TODO (Day 11): Wrap items with Framer Motion's AnimatePresence + motion.li
//   for smooth list animations when notes are added/removed.

import type { Note } from '../../types/index.ts'
import NoteListItem from './NoteListItem.tsx'

type Props = {
  notes: Note[]
}

function NoteList({ notes }: Props) {
  if (notes.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted">No notes yet. Create one!</p>
  }

  return (
    <ul className="overflow-y-auto flex-1 py-2">
      {notes.map((note) => (
        <NoteListItem key={note.id} note={note} />
      ))}
    </ul>
  )
}

export default NoteList
