import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn, LogOut, Pencil, UserPlus, Mail } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { mapAuthError } from "../utils/authErrors";
import { InlineAlert } from "./ErrorState";
import { logError } from "../utils/errors";

interface AuthScreenProps {
  onBack: () => void;
  onAuthed?: (displayName: string) => void;
  /** True when the user arrived via a reset-password email link. */
  recoveryMode?: boolean;
  onRecoveryDone?: () => void;
}

type Mode = "signin" | "signup";

export default function AuthScreen({ onBack, onAuthed, recoveryMode = false, onRecoveryDone }: AuthScreenProps) {
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

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
        // Defer the query out of the auth callback (auth-lock deadlock hazard).
        const { id } = s.user;
        const emailFallback = s.user.email ?? "";
        window.setTimeout(() => void loadProfile(id, emailFallback), 0);
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
          className="text-sm text-[#c9c2b4] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <div className="pcard rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-display font-bold text-[#f4f1ea]">Account unavailable</h2>
          <p className="text-sm text-[#c9c2b4] leading-relaxed">
            Cloud accounts need Supabase configuration. Add{" "}
            <code className="text-xs bg-white/[0.06] px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
            <code className="text-xs bg-white/[0.06] px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to{" "}
            <code className="text-xs bg-white/[0.06] px-1 rounded">.env.local</code>, then restart the
            app.
          </p>
          <p className="text-xs text-[#a49b8d]">
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
      logError("AuthScreen.submit", err);
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
      logError("AuthScreen.signOut", err);
      setError(mapAuthError(err instanceof Error ? err.message : "Sign out failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    const target = email.trim();
    if (!target || !target.includes("@")) {
      setError("Enter your account email above first, then tap “Forgot password?” again.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error: err } = await client.auth.resetPasswordForEmail(target, {
        redirectTo: window.location.origin,
      });
      if (err) throw err;
      setMessage(
        `Reset link sent to ${target}. Open it on this device — you'll be brought back here to set a new password.`
      );
    } catch (err: unknown) {
      logError("AuthScreen.forgotPassword", err);
      setError(mapAuthError(err instanceof Error ? err.message : "Could not send reset email"));
    } finally {
      setBusy(false);
    }
  };

  const handleSetNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error: err } = await client.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setNewPassword("");
      setConfirmPassword("");
      setChangePwOpen(false);
      setMessage("Password updated. Use it the next time you sign in.");
      onRecoveryDone?.();
    } catch (err: unknown) {
      logError("AuthScreen.setNewPassword", err);
      setError(mapAuthError(err instanceof Error ? err.message : "Could not update password"));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDisplayName = async (e: FormEvent) => {
    e.preventDefault();
    const uid = session?.user.id;
    if (!uid) return;
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const finalName = await ensureProfile(uid, trimmed);
      await client.auth.updateUser({ data: { display_name: finalName } });
      setProfileName(finalName);
      setEditingName(false);
      onAuthed?.(finalName);
      setMessage(
        finalName === trimmed
          ? "Display name updated — it appears on leaderboards from your next score."
          : `That name was taken, so you're still “${finalName}”. Try another.`
      );
    } catch (err: unknown) {
      logError("AuthScreen.saveDisplayName", err);
      setError(mapAuthError(err instanceof Error ? err.message : "Could not save display name"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#c9c2b4] font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#f4f1ea]">ACCOUNT</h2>
        <div className="w-12" />
      </div>

      <p className="text-sm text-[#c9c2b4] text-center leading-relaxed">
        Create an account to sync progress across devices, join online teams, and appear on
        leaderboards. You can still play without signing in.
      </p>

      {session ? (
        <div className="space-y-4">
          {(recoveryMode || changePwOpen) && (
            <form onSubmit={handleSetNewPassword} className="pcard rounded-2xl p-6 space-y-4" noValidate>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#f5b301]" aria-hidden="true" />
                <h3 className="text-sm font-display font-bold tracking-wide text-[#f4f1ea]">
                  {recoveryMode ? "SET A NEW PASSWORD" : "CHANGE PASSWORD"}
                </h3>
              </div>
              {recoveryMode && (
                <p className="text-xs text-[#c9c2b4] leading-relaxed">
                  You followed a reset link — choose a new password to finish.
                </p>
              )}
              <label className="block space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">
                  New password
                </span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#a49b8d] cursor-pointer"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">
                  Confirm new password
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
                  placeholder="Repeat the new password"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                  {busy ? "Please wait…" : "Save Password"}
                </button>
                {!recoveryMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setChangePwOpen(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setError(null);
                    }}
                    className="py-2.5 px-4 bg-white/[0.08] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="pcard rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#101014] text-[#fbbf24] flex items-center justify-center font-bold text-sm">
                {(profileName || session.user.email || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-bold text-[#f4f1ea] truncate">{profileName || "Player"}</p>
                <p className="text-xs text-[#a49b8d] truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {session.user.email}
                </p>
              </div>
              {!editingName && (
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(profileName);
                    setEditingName(true);
                    setError(null);
                    setMessage(null);
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-1.5 px-2.5 bg-white/[0.06] border border-white/10 rounded-lg text-[#c9c2b4] cursor-pointer"
                >
                  <Pencil className="w-3 h-3" aria-hidden="true" /> Edit name
                </button>
              )}
            </div>

            {editingName && (
              <form onSubmit={handleSaveDisplayName} className="psunken rounded-lg p-3 space-y-2" noValidate>
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">
                    New display name (leaderboards)
                  </span>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={24}
                    minLength={2}
                    required
                    autoComplete="nickname"
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
                    placeholder="Watchman42"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 py-2 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save Name"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setError(null);
                    }}
                    className="py-2 px-4 bg-white/[0.08] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <ul className="text-xs text-[#c9c2b4] space-y-1.5 psunken rounded-lg p-3 text-left">
              <li>• Progress syncs when you are signed in</li>
              <li>• Display name is used on leaderboards</li>
              <li>• Sign out keeps this device’s local save</li>
            </ul>
            {!recoveryMode && !changePwOpen && (
              <button
                type="button"
                onClick={() => {
                  setChangePwOpen(true);
                  setError(null);
                  setMessage(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-[#c9c2b4] cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                Change Password
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.08] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              {busy ? "Please wait…" : "Sign Out"}
            </button>
          </div>
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
                mode === "signin" ? "bg-[#101014] text-[#f8f1e3]" : "bg-white/[0.06] border border-white/10"
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
                mode === "signup" ? "bg-[#101014] text-[#f8f1e3]" : "bg-white/[0.06] border border-white/10"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "signup" && (
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">
                Display name (leaderboards)
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={24}
                required
                autoComplete="nickname"
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
                placeholder="Watchman42"
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#a49b8d]">
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
                className="w-full px-3 py-2 pr-10 rounded-lg border border-white/10 bg-white/[0.06] text-sm"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#a49b8d] cursor-pointer"
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

          {mode === "signin" && (
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={busy}
                className="text-[11px] font-semibold text-[#fbbf24] hover:text-[#f4f1ea] underline underline-offset-2 cursor-pointer disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {mode === "signup" ? (
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <p className="text-[11px] text-[#a49b8d] text-center leading-relaxed">
            {mode === "signup"
              ? "Depending on project settings, Supabase may require email confirmation before first sign-in."
              : "Use the email and password you registered with."}
          </p>
        </form>
      )}

      {message && <InlineAlert tone="success" message={message} />}
      {error && (
        <InlineAlert
          tone="error"
          title="Account error"
          message={error}
          actionLabel="Dismiss"
          onAction={() => setError(null)}
        />
      )}
    </div>
  );
}
