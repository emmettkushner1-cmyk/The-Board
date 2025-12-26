"use client";

import { useEffect, useState } from "react";
import { SubscriptionSlider } from "./SubscriptionSlider";
import { createClient } from "../../lib/supabase/client";

type Preview = {
  globalRank: number | null;
  localRank: number | null;
};

type Props = {
  initialAmount: number;
  isSubscribed: boolean;
};

export function PayPanel({ initialAmount, isSubscribed }: Props) {
  const [amount, setAmount] = useState(initialAmount);
  const [preview, setPreview] = useState<Preview>({ globalRank: null, localRank: null });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const response = await fetch("/api/leaderboard/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      if (!response.ok) return;
      const data = (await response.json()) as Preview;
      if (mounted) {
        setPreview(data);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [amount]);

  const handleCheckout = async () => {
    setLoading(true);
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      alert("Sign in first.");
      return;
    }
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url as string;
    } else if (data.updated) {
      alert("Subscription updated. Refreshing your status...");
      window.location.reload();
    } else {
      alert(data.error ?? "Unable to start checkout.");
    }
    setLoading(false);
  };

  const handleBillingPortal = async () => {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", {
      method: "PATCH"
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url as string;
    } else {
      alert(data.error ?? "Unable to open billing portal.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <SubscriptionSlider value={amount} onChange={setAmount} />
      <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
        <p className="text-white/60">Preview rank with this amount:</p>
        <div className="mt-2 flex flex-wrap gap-4">
          <span>Global: {preview.globalRank ? `#${preview.globalRank}` : "-"}</span>
          <span>Local: {preview.localRank ? `#${preview.localRank}` : "-"}</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-full bg-board-purple px-6 py-3 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
        >
          {isSubscribed ? "Update subscription" : "Start subscription"}
        </button>
        {isSubscribed && (
          <button
            type="button"
            onClick={handleBillingPortal}
            disabled={loading}
            className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
          >
            Manage billing
          </button>
        )}
      </div>
    </div>
  );
}
