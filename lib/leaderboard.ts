import { createServerSupabaseClient } from "./supabase/server";
import { getMonthKey } from "./utils";

export type LeaderboardScope = "global" | "country" | "state" | "city";

export type LeaderboardEntry = {
  user_id: string;
  amount_cents: number;
  username: string | null;
  is_anonymous: boolean | null;
  country: string | null;
  state: string | null;
  city: string | null;
  created_at: string | null;
};

export type LocationFilter = {
  country?: string | null;
  state?: string | null;
  city?: string | null;
};

const scopeFilters: Record<
  Exclude<LeaderboardScope, "global">,
  (profile: LeaderboardEntry, location: LocationFilter) => boolean
> = {
  country: (profile, location) =>
    !!location.country && profile.country === location.country,
  state: (profile, location) =>
    !!location.country &&
    !!location.state &&
    profile.country === location.country &&
    profile.state === location.state,
  city: (profile, location) =>
    !!location.country &&
    !!location.state &&
    !!location.city &&
    profile.country === location.country &&
    profile.state === location.state &&
    profile.city === location.city,
};

export async function getLeaderboard(
  scope: LeaderboardScope,
  location: LocationFilter = {}
) {
  const supabase = createServerSupabaseClient();
  const monthKey = getMonthKey();

  const { data, error } = await supabase
    .from("monthly_spend")
    .select(
      "amount_cents,user_id,profiles(username,is_anonymous,country,state,city,created_at)",
      { count: "exact" }
    )
    .eq("month_key", monthKey)
    .order("amount_cents", { ascending: false });

  if (error) throw error;

  const entries: LeaderboardEntry[] = (data ?? []).map((row: any) => {
    const p = row.profiles?.[0]; // profiles is an array
    return {
      user_id: row.user_id,
      amount_cents: row.amount_cents,
      username: p?.username ?? null,
      is_anonymous: p?.is_anonymous ?? null,
      country: p?.country ?? null,
      state: p?.state ?? null,
      city: p?.city ?? null,
      created_at: p?.created_at ?? null,
    };
  });

  if (scope === "global") return entries;
  return entries.filter((entry) => scopeFilters[scope](entry, location));
}

export async function getTopGlobal() {
  const entries = await getLeaderboard("global");
  return entries[0] ?? null;
}
