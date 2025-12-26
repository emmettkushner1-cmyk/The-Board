import Link from "next/link";
import { CountdownTimer } from "./components/CountdownTimer";
import { getTopGlobal } from "../lib/leaderboard";
import { formatMoney } from "../lib/utils";

export default async function HomePage() {
  const topGlobal = await getTopGlobal();

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-white/5 via-white/5 to-white/10 p-10 shadow-xl">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-semibold">
            A monthly social experiment where money = status. Minimum $0.10. No max. Resets monthly.
          </h1>
          <p className="text-white/70">
            Subscribe any amount to climb the leaderboard. Upgrade anytime to take the crown before the month resets.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/leaderboard"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-board-black"
            >
              View Leaderboard
            </Link>
            <Link
              href="/pay"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold"
            >
              Join
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="gradient-card rounded-3xl p-8">
          <h2 className="text-lg font-semibold">Countdown to reset (UTC)</h2>
          <p className="mt-2 text-sm text-white/60">
            Leaderboards reset on the first of every month at 00:00 UTC.
          </p>
          <div className="mt-6">
            <CountdownTimer />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-lg font-semibold">Current #1 Global</h2>
          {topGlobal ? (
            <div className="mt-4 space-y-2">
              <div className="text-3xl font-semibold text-board-gold">
                {topGlobal.is_anonymous ? "Anonymous" : topGlobal.username || "Anonymous"}
              </div>
              <div className="text-sm text-white/60">{formatMoney(topGlobal.amount_cents)} this month</div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">Be the first to claim the crown this month.</p>
          )}
        </div>
      </section>
    </div>
  );
}
