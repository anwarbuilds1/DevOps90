import { createBrowserClient } from "@supabase/ssr";

export const DEFAULT_SUPABASE_URL = "https://rmqerbjqfgldmszzfmns.supabase.co";
export const DEFAULT_SUPABASE_KEY = "sb_publishable_dwMGx9xCwE7qp1pln6V3sA_NKx33kxE";

export const getSupabaseUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

export const getSupabaseKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_KEY;

export const isBrowserSupabaseConfigured = true;

export const createClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return createBrowserClient(url, key);
};
