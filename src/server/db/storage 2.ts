import { createClient } from "@supabase/supabase-js";
import { env } from "techme/env";
export async function getSupabaseClient() {
  const client = createClient(env.SUPABASE_BASE_URL, env.SUPABASE_SECRET_KEY);
  return client;
}

export async function getStorage() {
  const client = await getSupabaseClient();
  return client.storage;
}
