import { AuthPanel } from "../components/AuthPanel";
import { ProfileForm } from "../components/ProfileForm";
import { ManageBillingButton } from "../components/ManageBillingButton";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { formatMoney } from "../../lib/utils";

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username,is_anonymous,country,state,city")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: billing } = user
    ? await supabase
        .from("billing")
        .select("amount_cents,status,current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-white/60">Set how you appear on the Board.</p>
      </div>

      <AuthPanel email={user?.email ?? null} />

      {user ? (
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Identity</h2>
            <div className="mt-4">
              <ProfileForm profile={profile} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
              <h2 className="text-lg font-semibold">Subscription</h2>
              <p className="mt-2 text-white/60">Status</p>
              <p className="mt-1 text-base font-semibold">{billing?.status ?? "not subscribed"}</p>
              <p className="mt-4 text-white/60">Monthly amount</p>
              <p className="mt-1 text-base font-semibold">
                {billing?.amount_cents ? formatMoney(billing.amount_cents) : "-"}
              </p>
              <p className="mt-4 text-white/60">Current period ends</p>
              <p className="mt-1 text-base font-semibold">
                {billing?.current_period_end
                  ? new Date(billing.current_period_end).toLocaleDateString()
                  : "-"}
              </p>
              <div className="mt-4">
                <ManageBillingButton />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
              <h2 className="text-lg font-semibold">Badges</h2>
              <p className="mt-2 text-white/60">
                Coming soon: unlock plaques for streaks, regional #1s, and Hall of Fame wins.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60">Sign in above to edit your profile.</p>
      )}
    </div>
  );
}
