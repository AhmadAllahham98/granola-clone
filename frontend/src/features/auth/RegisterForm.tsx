// ─── RegisterForm ─────────────────────────────────────────────────────────────
// Controlled form for email + password registration.
// On success: call setAuth() from AuthContext, then navigate to /notes.
//
// TODO (Day 11): Wire up the useMutation call to lib/auth.ts `register()`.

import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../lib/auth";
import { useAuth } from "../../context/AuthContext";

function RegisterForm() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      console.log("Registration successful!");
      auth.setAuth(data.user, data.token);
      navigate("/notes");
    },
    onError: (error) => {
      console.error("Error registering", error);
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    registerMutation.mutate({ email, password });
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

      <label className="flex flex-col gap-1 text-sm text-muted">
        Confirm Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="px-3 py-2 bg-surface-alt border border-border rounded text-text text-base outline-none focus:border-accent transition-colors"
        />
      </label>

      {error && <p className="text-sm text-danger font-medium">{error}</p>}
      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="py-2 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded transition-colors cursor-pointer"
      >
        {registerMutation.isPending ? "Creating account..." : "Create account"}
      </button>
      {registerMutation.isError && (
        <p className="text-red-500">Failed to register</p>
      )}
    </form>
  );
}

export default RegisterForm;
