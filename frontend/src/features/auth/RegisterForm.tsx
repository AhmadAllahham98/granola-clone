// ─── RegisterForm ─────────────────────────────────────────────────────────────
// Controlled form for email + password registration.
// On success: call setAuth() from AuthContext, then navigate to /notes.
//
// TODO (Day 11): Wire up the useMutation call to lib/auth.ts `register()`.

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function RegisterForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // TODO: Replace with useMutation calling register() from lib/auth.ts
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log('register', { email, password })
    navigate('/notes')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text">Create an account</h2>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="px-3 py-2 bg-surface-alt border border-border rounded text-text text-base outline-none focus:border-accent transition-colors"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="px-3 py-2 bg-surface-alt border border-border rounded text-text text-base outline-none focus:border-accent transition-colors"
        />
      </label>

      {/* TODO: Add confirm password field and client-side validation */}
      {/* TODO: Show error message here when registration fails */}

      <button
        type="submit"
        className="py-2 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded transition-colors cursor-pointer"
      >
        Create account
      </button>
    </form>
  )
}

export default RegisterForm
