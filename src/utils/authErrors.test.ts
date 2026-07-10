import { describe, expect, it } from "vitest";
import { mapAuthError } from "./authErrors";

describe("mapAuthError", () => {
  it("maps invalid credentials", () => {
    expect(mapAuthError("Invalid login credentials")).toMatch(/incorrect/i);
  });

  it("maps already registered", () => {
    expect(mapAuthError("User already registered")).toMatch(/Sign In/i);
  });

  it("maps unconfirmed email", () => {
    expect(mapAuthError("Email not confirmed")).toMatch(/Confirm your email/i);
  });

  it("passes through unknown messages", () => {
    expect(mapAuthError("Weird backend error")).toBe("Weird backend error");
  });
});
