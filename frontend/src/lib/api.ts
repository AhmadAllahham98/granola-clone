// ─── Base API fetch wrapper ───────────────────────────────────────────────────
// All API calls should go through `apiFetch`, NOT raw `fetch`.
// It handles:
//   - Prepending the base URL
//   - Attaching the JWT auth token from localStorage
//   - Deserialising JSON
//   - Throwing a structured error on non-2xx responses

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// TODO: replace this key with a constant shared from an auth module
const TOKEN_KEY = 'granola_token'

type FetchOptions = RequestInit & {
  // Convenience: pass a body as a plain object and it'll be JSON-stringified
  json?: unknown
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, ...restOptions } = options

  const token = localStorage.getItem(TOKEN_KEY)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Only attach Authorization header if a token exists
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(restOptions.headers ?? {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...restOptions,
    headers,
    // If a `json` body was passed, stringify it automatically
    body: json !== undefined ? JSON.stringify(json) : restOptions.body,
  })

  // Attempt to parse body regardless of status (error responses also have JSON bodies)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Throw an object that matches our ApiError type
    throw {
      message: data?.message ?? 'An unknown error occurred',
      status: response.status,
    }
  }

  return data as T
}
