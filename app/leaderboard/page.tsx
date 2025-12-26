import Link from "next/link";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { formatMoney, getMonthKey } from "../../lib/utils";
import { getLeaderboard, type LeaderboardEntry, type LeaderboardScope } from "../../lib/leaderboard";

const scopes: { label: string; value: LeaderboardScope }[] = [
  { label: "Global", value: "global" },
  { label: "Country", value: "country" },
  { label: "State", value: "state" },
  { label: "City", value: "city" }
];

function displayName(entry: LeaderboardEntry) {
  if (entry.is_anonymous) return "Anonymous";
  return entry.username || "Anonymous";
}

export default async function LeaderboardPage({
  searchParams
}: {
  searchParams?: { scope?: LeaderboardScope };
}) {
  const scope = searchParams?.scope && scopes.some((s) => s.value === searchParams.scope)
    ? searchParams.scope
    : "global";

  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("country,state,city").eq("user_id", user.id).single()
    : { data: null };

  const entries = await getLeaderboard(scope, {
    country: profile?.country ?? undefined,
    state: profile?.state ?? undefined,
    city: profile?.city ?? undefined
  });

  const userIndex = user ? entries.findIndex((entry) => entry.user_id === user.id) : -1;
  const nearYou = userIndex >= 0 ? entries.slice(Math.max(0, userIndex - 5), userIndex + 6) : [];

  const nextRankEntry = userIndex > 0 ? entries[userIndex - 1] : null;
  const currentEntry = userIndex >= 0 ? entries[userIndex] : null;
  const diffCents =
    nextRankEntry && currentEntry ? Math.max(nextRankEntry.amount_cents - currentEntry.amount_cents + 1, 0) : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Leaderboard</h1>
        <p className="mt-2 text-sm text-white/60">Month: {getMonthKey()}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {scopes.map((tab) => (
          <Link
            key={tab.value}
            href={`/leaderboard?scope=${tab.value}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              scope === tab.value ? "bg-white text-board-black" : "border border-white/20"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/60">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Badge</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.user_id} className="border-t border-white/10">
                <td className="px-4 py-3">#{index + 1}</td>
                <td className="px-4 py-3">{displayName(entry)}</td>
                <td className="px-4 py-3">{formatMoney(entry.amount_cents)}</td>
                <td className="px-4 py-3">{index === 0 ? "👑" : ""}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-white/60">
                  No spenders yet in this scope.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Near you</h2>
          <p className="mt-1 text-sm text-white/60">Five above and below your rank in this scope.</p>
          {user ? (
            <div className="mt-4 space-y-2 text-sm">
              {nearYou.length > 0 ? (
                nearYou.map((entry, index) => {
                  const startIndex = Math.max(0, userIndex - 5);
                  const rank = startIndex + index + 1;
                  return (
                    <div key={entry.user_id} className="flex justify-between">
                      <span>#{rank}</span>
                      <span>{displayName(entry)}</span>
                      <span>{formatMoney(entry.amount_cents)}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-white/60">Join the board to see your local rank.</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">Sign in to see your local rank.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Next target</h2>
          {user && currentEntry ? (
            <div className="mt-4 text-sm text-white/70">
              {nextRankEntry ? (
                <p>
                  You are {formatMoney(diffCents ?? 0)} away from passing #{userIndex} ({displayName(nextRankEntry)}).
                </p>
              ) : (
                <p>You are currently #1. Keep the crown.</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">Join the board to see how far you are from the next rank.</p>
          )}
        </div>
      </div>
    </div>
  );
}
