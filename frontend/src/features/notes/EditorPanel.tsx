// ─── EditorPanel ─────────────────────────────────────────────────────────────
// The right panel of the notes layout.
// Shows either an empty state (no note selected) or a note editor.
//
// This is the most complex component — it handles:
//   1. Loading the current note  (useNote hook)
//   2. Local state for title + content  (controlled inputs)
//   3. Auto-saving on change  (useDebounce + useUpdateNote)
//   4. The AI panel  (toggled by toolbar buttons)
//
// TODO (Day 10): Implement MarkdownEditor and EditorToolbar contents.
// TODO (Day 12): Wire up AIPanel with stream functions from lib/ai.ts.

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNote, useUpdateNote } from '../../hooks/useNotes.ts'
import { useDebounce } from '../../hooks/useDebounce.ts'
import EditorToolbar from './EditorToolbar.tsx'
import MarkdownEditor from './MarkdownEditor.tsx'
import AIPanel from './AIPanel.tsx'

function EditorPanel() {
  const { id } = useParams<{ id: string }>()

  const { data: note, isLoading } = useNote(id ?? '')
  const { mutate: updateNote } = useUpdateNote(id ?? '')

  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiMode, setAiMode]   = useState<'summarize' | 'action-items'>('summarize')

  // Sync local state when note loads or the selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  // Debounce: only save after 1.5s of no typing
  const debouncedContent = useDebounce(content, 1500)
  const debouncedTitle   = useDebounce(title, 1500)

  // Auto-save trigger — skips on initial mount (values equal note's current values)
  useEffect(() => {
    if (!id || !note) return
    if (debouncedContent === note.content && debouncedTitle === note.title) return
    updateNote({ title: debouncedTitle, content: debouncedContent })
  }, [debouncedContent, debouncedTitle])

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        Select a note to start editing, or create a new one.
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-muted text-sm">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EditorToolbar
        noteId={id}
        title={title}
        onTitleChange={setTitle}
        onSummarize={() => { setAiMode('summarize');     setAiPanelOpen(true) }}
        onActionItems={() => { setAiMode('action-items'); setAiPanelOpen(true) }}
      />

      <div className="flex-1 overflow-auto p-6">
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      {aiPanelOpen && (
        <AIPanel noteId={id} mode={aiMode} onClose={() => setAiPanelOpen(false)} />
      )}
    </div>
  )
}

export default EditorPanel
