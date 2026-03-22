// ─── NoteListItem ─────────────────────────────────────────────────────────────
// A single row in the sidebar note list.
// Clicking it navigates to /notes/:id and opens the note in the editor.

import { Link, useParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'motion/react'
import type { Note } from '../../types/index.ts'

type Props = {
  note: Note
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getPreview(content: string): string {
  const firstLine = content.split('\n').find((l) => l.trim()) ?? ''
  return firstLine.slice(0, 60) + (firstLine.length > 60 ? '…' : '')
}

function NoteListItem({ note }: Props) {
  const { id: activeId } = useParams()
  const isActive = activeId === note.id

  return (
    <motion.li
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      layout
    >
      <Link
        to={`/notes/${note.id}`}
        className={clsx(
          'flex flex-col gap-0.5 px-4 py-3 text-left no-underline transition-colors',
          'hover:bg-surface-alt',
          isActive && 'bg-surface-alt border-l-2 border-accent pl-[14px]'
        )}
      >
        <span className="text-sm font-medium text-text truncate">
          {note.title || <em className="text-muted">Untitled</em>}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[11px] text-muted shrink-0">{formatDate(note.updatedAt)}</span>
          <span className="text-[11px] text-muted truncate">{getPreview(note.content)}</span>
        </span>
      </Link>
    </motion.li>
  )
}

export default NoteListItem
