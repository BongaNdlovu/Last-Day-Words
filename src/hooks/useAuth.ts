import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthStatus = "loading" | "configured" | "unconfigured";

async function loadDisplayName(user: User): Promise<string> {
  if (!supabase) {
    return (
      (user.user_metadata?.display_name as string | undefined)?.trim() ||
      user.email?.split("@")[0] ||
      "Player"
    );
  }
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.display_name) return data.display_name as string;
  const meta = (user.user_metadata?.display_name as string | undefined)?.trim();
  if (meta && meta.length >= 2) return meta;
  return user.email?.split("@")[0] || "Player";
}

export function useAuth() {
  const [status] = useState<AuthStatus>(() =>
    isSupabaseConfigured && supabase ? "configured" : "unconfigured"
  );
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured && !!supabase);
  /** True after the user lands from a reset-password email until they set a new password. */
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next);
    if (!next?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const displayName = await loadDisplayName(next.user);
    setUser({
      id: next.user.id,
      email: next.user.email ?? "",
      displayName,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const client = supabase;
    let cancelled = false;

    client.auth.getSession().then(({ data }) => {
      if (!cancelled) void applySession(data.session);
    });

    const { data: sub } = client.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      // Defer out of the auth callback: supabase queries inside
      // onAuthStateChange can deadlock on the client's auth lock.
      window.setTimeout(() => {
        if (!cancelled) void applySession(s);
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    await applySession(session);
  }, [applySession, session]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const clearPasswordRecovery = useCallback(() => setPasswordRecovery(false), []);

  return {
    status,
    loading,
    session,
    user,
    isSignedIn: Boolean(user),
    passwordRecovery,
    clearPasswordRecovery,
    refreshProfile,
    signOut,
  };
}
