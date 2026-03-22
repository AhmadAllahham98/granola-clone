// ─── Auth API calls ───────────────────────────────────────────────────────────

import { apiFetch } from './api.ts'
import type { AuthResponse } from '../types/index.ts'

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────────
// On success, store the returned token in localStorage.
export function login(data: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', json: data })
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────────
export function register(data: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', json: data })
}
