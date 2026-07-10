/** Map Supabase auth error strings to short, user-facing messages. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "That email already has an account. Try Sign In instead.";
  }
  if (m.includes("password") && m.includes("at least")) {
    return "Password must be at least 6 characters.";
  }
  if (m.includes("email") && m.includes("invalid")) {
    return "Please enter a valid email address.";
  }
  if (m.includes("rate") || m.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (m.includes("confirm") || m.includes("not confirmed")) {
    return "Confirm your email first (check your inbox), then sign in.";
  }
  return message || "Authentication failed.";
}
