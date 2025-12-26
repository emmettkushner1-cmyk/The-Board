"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", { method: "PATCH" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url as string;
    } else {
      alert(data.error ?? "Unable to open billing portal.");
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-wide"
    >
      Manage subscription
    </button>
  );
}
