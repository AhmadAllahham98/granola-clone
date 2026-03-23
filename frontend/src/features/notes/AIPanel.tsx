// ─── AIPanel ─────────────────────────────────────────────────────────────────
// Slides in from the right when the user hits "Summarize" or "Action Items".
// Streams the LLM response chunk by chunk using async generators from lib/ai.ts.
//
// TODO (Day 12): Replace the placeholder useEffect with real SSE streaming:
//
//   import { streamSummarize, streamActionItems } from '../../lib/ai.ts'
//
//   useEffect(() => {
//     setOutput('')
//     setIsStreaming(true)
//     const gen = mode === 'summarize' ? streamSummarize(noteId) : streamActionItems(noteId)
//     ;(async () => {
//       for await (const chunk of gen) { setOutput(prev => prev + chunk) }
//       setIsStreaming(false)
//     })()
//   }, [noteId, mode])

import { useEffect, useState } from 'react'
import { streamSummarize, streamActionItems } from '../../lib/ai'

type Props = {
  noteId: string
  mode: 'summarize' | 'action-items'
  onClose: () => void
}

function AIPanel({ noteId, mode, onClose }: Props) {
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    setOutput('')
    setIsStreaming(true)
    
    // We should allow cancelling the stream if unmounted
    let isCancelled = false;

    const stream = async () => {
      try {
        const gen = mode === 'summarize' ? streamSummarize(noteId) : streamActionItems(noteId)
        for await (const chunk of gen) {
          if (isCancelled) break;
          setOutput(prev => prev + chunk)
        }
      } catch {
        if (!isCancelled) setOutput(prev => prev + '\n[Error: Connection failed]')
      } finally {
        if (!isCancelled) setIsStreaming(false)
      }
    }

    stream()

    return () => {
      isCancelled = true;
    }
  }, [noteId, mode])

  const heading = mode === 'summarize' ? 'Summary' : 'Action Items'

  return (
    // Slide in from right — fixed position over the editor panel
    <aside className="fixed top-0 right-0 w-90 h-screen bg-surface border-l border-border flex flex-col z-50 animate-[slideIn_0.2s_ease-out]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-accent">{heading}</h3>
        <button
          onClick={onClose}
          aria-label="Close AI panel"
          className="text-muted hover:text-text transition-colors cursor-pointer text-base px-1"
        >
          ✕
        </button>
      </div>

      {/* Streamed output */}
      <div className="flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-text whitespace-pre-wrap">
        {isStreaming && <span className="text-accent animate-pulse">▌</span>}
        <p>{output}</p>
      </div>
    </aside>
  )
}

export default AIPanel
