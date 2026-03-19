// ─── LoginForm ────────────────────────────────────────────────────────────────
// Controlled form for email + password login.
// On success: call setAuth() from AuthContext, then navigate to /notes.
//
// TODO (Day 11): Wire up the useMutation call to lib/auth.ts `login()`.

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // TODO: Replace with useMutation calling login() from lib/auth.ts,
  //       then call setAuth() from useAuth() context hook
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log('login', { email, password })
    navigate('/notes')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text">Welcome back</h2>

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
          autoComplete="current-password"
          className="px-3 py-2 bg-surface-alt border border-border rounded text-text text-base outline-none focus:border-accent transition-colors"
        />
      </label>

      {/* TODO: Show error message here when login fails */}

      <button
        type="submit"
        className="py-2 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded transition-colors cursor-pointer"
      >
        Log in
      </button>
    </form>
  )
}

export default LoginForm
