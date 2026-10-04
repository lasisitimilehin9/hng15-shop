"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Authentication is not configured. Add Supabase env vars on Vercel.");
        setLoading(false);
        return;
      }
      const origin = window.location.origin;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/orders`,
        },
      });
      if (err) setError(err.message);
    } catch {
      setError(
        "Authentication is not configured. Add Supabase and Google OAuth credentials."
      );
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-stone-900">
        Sign in
      </h1>
      <p className="mt-2 text-stone-600">
        Sign in with Google to checkout and view your order history.
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium hover:bg-stone-50 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}
