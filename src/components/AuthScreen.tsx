import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, LogIn, LogOut, UserPlus, Mail } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { mapAuthError } from "../utils/authErrors";

interface AuthScreenProps {
  onBack: () => void;
  onAuthed?: (displayName: string) => void;
}

type Mode = "signin" | "signup";

export default function AuthScreen({ onBack, onAuthed }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void loadProfile(data.session.user.id, data.session.user.email ?? "");
      }
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        void loadProfile(s.user.id, s.user.email ?? "");
      } else {
        setProfileName("");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string, emailFallback: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    const name =
      (data?.display_name as string | undefined) ||
      emailFallback.split("@")[0] ||
      "Player";
    setProfileName(name);
  }

  async function ensureProfile(userId: string, name: string) {
    if (!supabase) return name;
    const trimmed = name.trim().slice(0, 24);
    if (trimmed.length < 2) return name;
    const { error } = await supabase.from("profiles").upsert(
      { id: userId, display_name: trimmed },
      { onConflict: "id" }
    );
    if (error && error.code === "23505") {
      // unique display_name — keep existing profile name
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      return (data?.display_name as string | undefined) || trimmed;
    }
    return trimmed;
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="max-w-md mx-auto space-y-4 p-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#5c4a33] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <div className="pcard rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-display font-bold text-[#2a2018]">Account unavailable</h2>
          <p className="text-sm text-[#5c4a33] leading-relaxed">
            Cloud accounts need Supabase configuration. Add{" "}
            <code className="text-xs bg-[#fbf5e9] px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
            <code className="text-xs bg-[#fbf5e9] px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to{" "}
            <code className="text-xs bg-[#fbf5e9] px-1 rounded">.env.local</code>, then restart the
            app.
          </p>
          <p className="text-xs text-[#6b5537]">
            You can still play offline — progress stays on this device.
          </p>
        </div>
      </div>
    );
  }

  const client = supabase;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const name = displayName.trim();
        if (name.length < 2) {
          setError("Display name must be at least 2 characters.");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const { data, error: err } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (err) throw err;

        if (data.user && !data.session) {
          setMessage(
            "Account created. Check your email to confirm, then use Sign In with the same email and password."
          );
          setMode("signin");
          setPassword("");
          return;
        }

        if (data.session?.user) {
          const finalName = await ensureProfile(data.session.user.id, name);
          setProfileName(finalName);
          onAuthed?.(finalName);
          setMessage("Welcome! Your account is ready and you are signed in.");
        }
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const { data, error: err } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        const uid = data.session?.user.id;
        if (uid) {
          const { data: profile } = await client
            .from("profiles")
            .select("display_name")
            .eq("id", uid)
            .maybeSingle();
          const name =
            (profile?.display_name as string | undefined) ||
            (data.session?.user.user_metadata?.display_name as string | undefined) ||
            data.session?.user.email?.split("@")[0] ||
            "Player";
          setProfileName(name);
          onAuthed?.(name);
        }
        setMessage("Signed in successfully.");
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Auth failed";
      setError(mapAuthError(raw));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.auth.signOut();
      setMessage("Signed out. Local progress on this device is unchanged.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#5c4a33] font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">ACCOUNT</h2>
        <div className="w-12" />
      </div>

      <p className="text-sm text-[#5c4a33] text-center leading-relaxed">
        Create an account to sync progress across devices, join online teams, and appear on
        leaderboards. You can still play without signing in.
      </p>

      {session ? (
        <div className="pcard rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#2a2018] text-[#fbbf24] flex items-center justify-center font-bold text-sm">
              {(profileName || session.user.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-bold text-[#2a2018] truncate">{profileName || "Player"}</p>
              <p className="text-xs text-[#6b5537] truncate flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0" aria-hidden="true" />
                {session.user.email}
              </p>
            </div>
          </div>
          <ul className="text-xs text-[#5c4a33] space-y-1.5 psunken rounded-lg p-3 text-left">
            <li>• Progress syncs when you are signed in</li>
            <li>• Display name is used on leaderboards</li>
            <li>• Sign out keeps this device’s local save</li>
          </ul>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#f0e3c8] border border-[#e2d2ac] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            {busy ? "Please wait…" : "Sign Out"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pcard rounded-2xl p-6 space-y-4" noValidate>
          <div className="flex gap-2" role="tablist" aria-label="Account mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => {
                setMode("signin");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                mode === "signin" ? "bg-[#2a2018] text-[#f8f1e3]" : "bg-[#fbf5e9] border border-[#e2d2ac]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                mode === "signup" ? "bg-[#2a2018] text-[#f8f1e3]" : "bg-[#fbf5e9] border border-[#e2d2ac]"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "signup" && (
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537]">
                Display name (leaderboards)
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={24}
                required
                autoComplete="nickname"
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
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537]">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6b5537] cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2a2018] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {mode === "signup" ? (
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <p className="text-[11px] text-[#6b5537] text-center leading-relaxed">
            {mode === "signup"
              ? "Depending on project settings, Supabase may require email confirmation before first sign-in."
              : "Use the email and password you registered with."}
          </p>
        </form>
      )}

      {message && (
        <p className="text-sm text-emerald-800 text-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-sm text-red-800 text-center bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}
