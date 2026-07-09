import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anon!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Profile = {
  id: string;
  display_name: string;
  created_at?: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  score: number;
  words_solved: number;
  week_key: string;
};

export type GameRoom = {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "playing" | "finished";
  created_at: string;
};
