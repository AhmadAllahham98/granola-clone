// ─── AI API calls ─────────────────────────────────────────────────────────────
// These use Server-Sent Events (SSE) for streaming responses from the backend.
// The backend will stream text chunks as they arrive from the LLM.

// Ensure we match the backend proxy/prefixed route, which usually includes /api
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
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

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status} ${response.statusText}`
    try {
      const errorJson = await response.json()
      if (errorJson?.message) {
        errorMsg = errorJson.message
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg)
  }

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })

    // SSE format: blocks separated by \n\n, lines start with "data: "
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        const chunk = line.slice('data: '.length).trim()
        if (chunk === '[DONE]') {
          return
        }
        
        if (chunk) {
          try {
            // Backend sends JSON-encoded strings to handle newlines correctly
            yield JSON.parse(chunk)
          } catch {
            // fallback if it's not JSON
            yield chunk
          }
        }
      }
    }
  }
}

// ─── GET /api/notes/:id/summarize (SSE) ──────────────────────────────────────────
export function streamSummarize(noteId: string): AsyncGenerator<string> {
  return streamFromSSE(`/api/notes/${noteId}/summarize`)
}

// ─── GET /api/notes/:id/action-items (SSE) ───────────────────────────────────────
export function streamActionItems(noteId: string): AsyncGenerator<string> {
  return streamFromSSE(`/api/notes/${noteId}/action-items`)
}
