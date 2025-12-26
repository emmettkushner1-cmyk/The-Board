import { AuthPanel } from "../components/AuthPanel";
import { PayPanel } from "../components/PayPanel";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { formatMoney } from "../../lib/utils";

export default async function PayPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: billing } = user
    ? await supabase
        .from("billing")
        .select("amount_cents,status")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const isSubscribed = billing?.status === "active" || billing?.status === "trialing";
  const currentAmount = billing?.amount_cents ? billing.amount_cents / 100 : 5;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Join the Board</h1>
        <p className="mt-2 text-sm text-white/60">
          Set a monthly amount to climb the leaderboard. Upgrade anytime to move up.
        </p>
      </div>

      <AuthPanel email={user?.email ?? null} />

      {user ? (
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <PayPanel initialAmount={currentAmount} isSubscribed={isSubscribed} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
            <h2 className="text-lg font-semibold">Current status</h2>
            <p className="mt-2 text-white/60">Subscription status</p>
            <p className="mt-1 text-base font-semibold">{billing?.status ?? "not subscribed"}</p>
            <p className="mt-4 text-white/60">Current amount</p>
            <p className="mt-1 text-base font-semibold">
              {billing?.amount_cents ? formatMoney(billing.amount_cents) : "-"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60">Sign in above to unlock the subscription slider.</p>
      )}
    </div>
  );
}
