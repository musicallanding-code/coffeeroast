/**
 * Public runtime config. Values come from EXPO_PUBLIC_* env vars (see .env.example).
 * The anon key is safe to ship in the client; row-level security protects the data.
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
