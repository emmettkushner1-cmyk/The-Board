import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  return createServerComponentClient({ cookies });
}

export function createRouteSupabaseClient() {
  return createRouteHandlerClient({ cookies });
}
