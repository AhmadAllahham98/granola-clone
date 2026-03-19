// ─── AuthContext ──────────────────────────────────────────────────────────────
// Provides auth state (user, token) and actions (login, logout) to the whole app.
// Wrap <App /> with <AuthProvider> in main.tsx (TODO: Day 11).
//
// Why context and not TanStack Query?
//   Auth state is "client-side truth" — it's driven by localStorage, not the server.
//   TanStack Query is for server data that needs fetching and caching.

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types/index.ts'

const TOKEN_KEY = 'granola_token'

// ─── Shape of the context value ──────────────────────────────────────────────
type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  // Call these after a successful API login/logout
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

// ─── Create context ───────────────────────────────────────────────────────────
// `undefined` default — components must be inside <AuthProvider> to use this
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────
// TODO (Day 11): Add this to main.tsx wrapping the whole app
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so auth persists across page refreshes
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)

  function setAuth(user: User, token: string) {
    localStorage.setItem(TOKEN_KEY, token)
    setToken(token)
    setUser(user)
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Usage: const { user, isAuthenticated, setAuth, clearAuth } = useAuth()
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
