import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
import { getMonthKey } from "../../../../lib/utils";

type MonthlySpendRow = {
  amount_cents: number;
  user_id: string;
  profiles: {
    country: string | null;
    state: string | null;
    city: string | null;
    created_at: string | null;
  } | null;
};

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { amount?: number };
  const amount = Math.max(Number(body.amount ?? 0), 0.1);
  const amountCents = Math.round(amount * 100);

  const { data: profile } = await supabase
    .from("profiles")
    .select("country,state,city,created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const monthKey = getMonthKey();
  const { data: rows, error } = await supabase
    .from("monthly_spend")
    .select("amount_cents,user_id,profiles(country,state,city,created_at)")
    .eq("month_key", monthKey)
    .order("amount_cents", { ascending: false })
    .order("created_at", { ascending: true, foreignTable: "profiles" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const createdAt = profile?.created_at ?? new Date().toISOString();
  const rowsData = (rows ?? []) as MonthlySpendRow[];
  const computeRank = (list: MonthlySpendRow[]) => {
    let rank = 1;
    list.forEach((entry) => {
      if (entry.amount_cents > amountCents) {
        rank += 1;
      } else if (entry.amount_cents === amountCents) {
        if ((entry.profiles?.created_at ?? "") < createdAt) {
          rank += 1;
        }
      }
    });
    return rank;
  };

  const globalRank = computeRank(rowsData);

  const localRows = rowsData.filter((entry) => {
    if (!profile?.country) return false;
    if (entry.profiles?.country !== profile.country) return false;
    if (profile.state && entry.profiles?.state !== profile.state) return false;
    if (profile.city && entry.profiles?.city !== profile.city) return false;
    return true;
  });

  const localRank = localRows.length > 0 ? computeRank(localRows) : null;

  return NextResponse.json({ globalRank, localRank });
}
