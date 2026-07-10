import { describe, expect, it } from "vitest";
import { isSupabaseConfigured } from "../lib/supabase";

describe("useAuth / supabase config", () => {
  it("exposes configuration flag for gated UI", () => {
    expect(typeof isSupabaseConfigured).toBe("boolean");
  });
});
