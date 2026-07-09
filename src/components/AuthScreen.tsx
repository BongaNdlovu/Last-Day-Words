import React, { useEffect, useState } from "react";
import { ArrowLeft, LogIn, UserPlus, LogOut } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthScreenProps {
  onBack: () => void;
  onAuthed?: (displayName: string) => void;
}

export default function AuthScreen({ onBack, onAuthed }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="max-w-md mx-auto space-y-4 p-4">
        <button onClick={onBack} className="text-sm text-[#5c4a33] flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm text-red-800">Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        if (displayName.trim().length < 2) {
          setError("Display name must be at least 2 characters.");
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        } else if (data.session) {
          onAuthed?.(displayName.trim());
          setMessage("Signed up and signed in.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .maybeSingle();
        onAuthed?.(profile?.display_name ?? displayName);
        setMessage("Signed in.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#5c4a33] font-medium cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">ACCOUNT</h2>
        <div className="w-12" />
      </div>

      {session ? (
        <div className="pcard rounded-2xl p-6 space-y-4">
          <p className="text-sm text-[#5c4a33]">
            Signed in as <strong className="text-[#2a2018]">{session.user.email}</strong>
          </p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#f0e3c8] border border-[#e2d2ac] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pcard rounded-2xl p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                mode === "signup" ? "bg-[#2a2018] text-[#f8f1e3]" : "bg-[#fbf5e9] border border-[#e2d2ac]"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                mode === "signin" ? "bg-[#2a2018] text-[#f8f1e3]" : "bg-[#fbf5e9] border border-[#e2d2ac]"
              }`}
            >
              Sign In
            </button>
          </div>

          {mode === "signup" && (
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537]">Display name (leaderboards)</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={24}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm"
                placeholder="Watchman42"
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2a2018] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {mode === "signup" ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <p className="text-[11px] text-[#6b5537] text-center">
            Email confirmation is required before first sign-in (Supabase default).
          </p>
        </form>
      )}

      {message && <p className="text-sm text-emerald-800 text-center">{message}</p>}
      {error && <p className="text-sm text-red-800 text-center">{error}</p>}
    </div>
  );
}
