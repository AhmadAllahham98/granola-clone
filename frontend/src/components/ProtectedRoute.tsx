// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps routes that require authentication.
// If the user is not logged in, redirects to /login.
//
// Usage in App.tsx:
//   <Route path="/notes/*" element={<ProtectedRoute><NotesLayout /></ProtectedRoute>} />

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
