// ─── useDebounce ──────────────────────────────────────────────────────────────
// Returns a debounced version of `value` that only updates after `delay` ms of
// inactivity. Used for the note editor auto-save and search input.
//
// Usage:
//   const debouncedContent = useDebounce(content, 1500)
//   useEffect(() => { saveNote(debouncedContent) }, [debouncedContent])

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    // Cleanup: cancel the timer if value changes before delay is up
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
