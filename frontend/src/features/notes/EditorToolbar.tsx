// ─── EditorToolbar ────────────────────────────────────────────────────────────
// The top bar of the editor panel.
// Contains:
//   - Note title input (auto-saves via debounce in EditorPanel)
//   - Buttons: Summarize, Action Items, Delete
//
// Radix AlertDialog is used for delete confirmation — it handles open/close
// state internally via Trigger/Cancel/Action, so no local state is needed here.
//
// TODO (Day 10): Add Radix DropdownMenu for extra actions (e.g. templates).

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useNavigate } from 'react-router-dom'
import { useDeleteNote } from '../../hooks/useNotes.ts'

type Props = {
  noteId: string
  title: string
  onTitleChange: (value: string) => void
  onSummarize: () => void
  onActionItems: () => void
}

function EditorToolbar({ noteId, title, onTitleChange, onSummarize, onActionItems }: Props) {
  const navigate = useNavigate()
  const { mutate: deleteNote } = useDeleteNote()

  function handleDelete() {
    deleteNote(noteId, {
      onSuccess: () => navigate('/notes'),
    })
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface">
      {/* Title input — controlled by EditorPanel */}
      <input
        type="text"
        placeholder="Untitled"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-xl font-semibold text-text placeholder:text-muted"
      />

      <div className="flex gap-2 shrink-0">
        {/* AI actions */}
        <button
          onClick={onSummarize}
          className="px-3 py-1 text-sm bg-surface-alt border border-border rounded text-text hover:bg-border transition-colors cursor-pointer"
        >
          Summarize
        </button>
        <button
          onClick={onActionItems}
          className="px-3 py-1 text-sm bg-surface-alt border border-border rounded text-text hover:bg-border transition-colors cursor-pointer"
        >
          Action Items
        </button>

        {/* Delete with Radix AlertDialog confirmation */}
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button className="px-3 py-1 text-sm border border-danger rounded text-danger hover:bg-danger/10 transition-colors cursor-pointer">
              Delete
            </button>
          </AlertDialog.Trigger>

          <AlertDialog.Portal>
            {/* Overlay */}
            <AlertDialog.Overlay className="fixed inset-0 bg-black/60" />
            {/* Dialog */}
            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-xl p-8 min-w-80 flex flex-col gap-4">
              <AlertDialog.Title className="text-base font-semibold text-text">
                Delete this note?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted">
                This action cannot be undone.
              </AlertDialog.Description>
              <div className="flex justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <button className="px-3 py-1 text-sm bg-surface-alt border border-border rounded text-text hover:bg-border transition-colors cursor-pointer">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-sm border border-danger rounded text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  )
}

export default EditorToolbar
