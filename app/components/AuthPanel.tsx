"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export function AuthPanel({ email }: { email?: string | null }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: `${window.location.origin}/profile` }
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email for a magic link.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (email) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <p className="mb-3 text-white/80">Signed in as {email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg bg-white/10 px-3 py-2 text-xs uppercase tracking-wide hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
      <p className="mb-3 text-white/80">Sign in with your email to join.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type="email"
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSignIn}
          className="rounded-lg bg-board-purple px-4 py-2 text-xs font-semibold uppercase tracking-wide"
        >
          Send link
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-white/60">{status}</p>}
    </div>
  );
}
