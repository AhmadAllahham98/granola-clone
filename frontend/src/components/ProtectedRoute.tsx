// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps routes that require authentication.
// If the user is not logged in, redirects to /login.
//
// Usage in App.tsx:
//   <Route path="/notes/*" element={<ProtectedRoute><NotesLayout /></ProtectedRoute>} />

/* import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx"; */
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function ProtectedRoute({ children }: Props) {
  // const { isAuthenticated } = useAuth()

  // TODO (Day 11): Once AuthContext is wired up, this will read real auth state.
  // For now during Day 10 dev, you can hardcode `isAuthenticated = true` to skip auth.
  /* if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  } */

  return <>{children}</>;
}

export default ProtectedRoute;
