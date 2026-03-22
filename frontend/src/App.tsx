import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPage from "./features/auth/AuthPage.tsx";
import NotesLayout from "./features/notes/NotesLayout.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AnimatePresence } from "motion/react";

// TODO (Day 11): Wrap the app with an AuthContext.Provider so that
//   login/logout state is accessible from any component via useAuth()

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route
            path="/notes/*"
            element={
              <ProtectedRoute>
                <NotesLayout />
              </ProtectedRoute>
            }
          />

          {/* Default: redirect root to /notes */}
          <Route path="/" element={<Navigate to="/notes" replace />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
