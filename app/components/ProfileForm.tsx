"use client";

import { useState } from "react";

type Props = {
  profile: {
    username: string | null;
    is_anonymous: boolean | null;
    country: string | null;
    state: string | null;
    city: string | null;
  } | null;
};

export function ProfileForm({ profile }: Props) {
  const [form, setForm] = useState({
    username: profile?.username ?? "",
    is_anonymous: profile?.is_anonymous ?? false,
    country: profile?.country ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? ""
  });
  const [status, setStatus] = useState<string | null>(null);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!response.ok) {
      const data = await response.json();
      setStatus(data.error ?? "Update failed");
    } else {
      setStatus("Profile updated.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-widest text-white/50">Username</label>
        <input
          value={form.username}
          onChange={(event) => updateField("username", event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_anonymous}
          onChange={(event) => updateField("is_anonymous", event.target.checked)}
        />
        Anonymous mode
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50">Country</label>
          <input
            value={form.country}
            onChange={(event) => updateField("country", event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50">State</label>
          <input
            value={form.state}
            onChange={(event) => updateField("state", event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/50">City</label>
          <input
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-full bg-board-purple px-6 py-2 text-xs font-semibold uppercase tracking-wide"
      >
        Save profile
      </button>
      {status && <p className="text-xs text-white/60">{status}</p>}
    </form>
  );
}
