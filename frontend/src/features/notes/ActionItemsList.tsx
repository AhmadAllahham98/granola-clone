import { useUpdateActionItem, useDeleteActionItem } from '../../hooks/useNotes.ts'
import type { ActionItem } from '../../types/index.ts'

type Props = {
  noteId: string
  items: ActionItem[]
}

export default function ActionItemsList({ noteId, items }: Props) {
  const updateMutation = useUpdateActionItem(noteId)
  const deleteMutation = useDeleteActionItem(noteId)

  if (!items || items.length === 0) return null

  return (
    <div className="mt-12 border-t border-border pt-6 pb-12">
      <h3 className="text-lg font-semibold text-text mb-4">Action Items</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 group">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={(e) => updateMutation.mutate({ id: item.id, isCompleted: e.target.checked })}
              className="mt-1.5 w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className={`flex-1 text-base leading-relaxed ${item.isCompleted ? 'line-through text-muted/60' : 'text-text'}`}>
              {item.description}
            </span>
            <button
              onClick={() => deleteMutation.mutate(item.id)}
              disabled={deleteMutation.isPending}
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity p-1 rounded-md hover:bg-red-500/10"
              aria-label="Delete action item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
