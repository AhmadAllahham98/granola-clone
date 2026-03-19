// ─── AI API calls ─────────────────────────────────────────────────────────────
// These use Server-Sent Events (SSE) for streaming responses from the backend.
// The backend will stream text chunks as they arrive from the LLM.
//
// Usage pattern:
//   const stream = streamSummarize(noteId)
//   for await (const chunk of stream) {
//     setOutput(prev => prev + chunk)
//   }
//
// TODO (Day 12): Implement these when you add the LLM backend routes.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const TOKEN_KEY = 'granola_token'

// ─── Shared SSE streaming helper ──────────────────────────────────────────────
// Returns an async generator that yields text chunks as they arrive.
async function* streamFromSSE(path: string): AsyncGenerator<string> {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })

    // SSE format: lines starting with "data: " contain the actual chunk
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        const chunk = line.slice('data: '.length)
        if (chunk !== '[DONE]') yield chunk
      }
    }
  }
}

// ─── GET /notes/:id/summarize (SSE) ──────────────────────────────────────────
export function streamSummarize(noteId: string): AsyncGenerator<string> {
  return streamFromSSE(`/notes/${noteId}/summarize`)
}

// ─── GET /notes/:id/action-items (SSE) ───────────────────────────────────────
export function streamActionItems(noteId: string): AsyncGenerator<string> {
  return streamFromSSE(`/notes/${noteId}/action-items`)
}
