import { createServerSupabaseClient } from "../../lib/supabase/server";
import { formatMoney } from "../../lib/utils";

export default async function HallOfFamePage() {
  const supabase = createServerSupabaseClient();
  const { data: winners } = await supabase
    .from("hall_of_fame")
    .select("month_key,username_snapshot,amount_cents,link_url")
    .order("month_key", { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Hall of Fame</h1>
        <p className="mt-2 text-sm text-white/60">Only Global #1 each month enters the Hall of Fame.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/60">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Winner</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {(winners ?? []).map((winner) => (
              <tr key={winner.month_key} className="border-t border-white/10">
                <td className="px-4 py-3">{winner.month_key}</td>
                <td className="px-4 py-3">{winner.username_snapshot || "Anonymous"}</td>
                <td className="px-4 py-3">{formatMoney(winner.amount_cents)}</td>
                <td className="px-4 py-3">
                  {winner.link_url ? (
                    <a href={winner.link_url} className="text-board-purple" target="_blank" rel="noreferrer">
                      Visit
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {(winners ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-white/60">
                  No Hall of Fame winners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
