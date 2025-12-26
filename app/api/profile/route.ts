import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../lib/supabase/server";
import { sanitizeLocation, sanitizeUsername } from "../../../lib/utils";

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    username?: string;
    is_anonymous?: boolean;
    country?: string;
    state?: string;
    city?: string;
  };

  const updates = {
    username: body.username ? sanitizeUsername(body.username) : null,
    is_anonymous: body.is_anonymous ?? false,
    country: body.country ? sanitizeLocation(body.country) : null,
    state: body.state ? sanitizeLocation(body.state) : null,
    city: body.city ? sanitizeLocation(body.city) : null
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
