/**
 * Set Supabase Auth Site URL + redirect allow-list for production.
 * Uses SUPABASE_ACCESS_TOKEN, or the token from `npx supabase login`.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT_REF = "haoghddjcstxanrtggvb";
const SITE_URL = "https://last-day-words.vercel.app";
const REDIRECT_URLS = [
  "http://localhost:3000",
  "http://localhost:3000/**",
  "http://localhost:4173",
  "http://localhost:4173/**",
  "http://localhost:4180",
  "http://localhost:4180/**",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3000/**",
  "https://last-day-words.vercel.app",
  "https://last-day-words.vercel.app/**",
];

function readCliToken() {
  const candidates = [
    path.join(process.env.APPDATA ?? "", "supabase", "access-token"),
    path.join(os.homedir(), ".supabase", "access-token"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const t = fs.readFileSync(file, "utf8").trim();
        if (t) return t;
      }
    } catch {
      /* try next */
    }
  }
  return process.env.SUPABASE_ACCESS_TOKEN?.trim() ?? "";
}

const token = readCliToken();
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const getRes = await fetch(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!getRes.ok) {
  console.error("GET auth config failed:", getRes.status, await getRes.text());
  process.exit(1);
}
const current = await getRes.json();
console.log("Current site_url:", current.site_url ?? "(unset)");
console.log("Current uri_allow_list:", current.uri_allow_list ?? "(unset)");

const existing = (current.uri_allow_list ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const merged = [...new Set([...existing, ...REDIRECT_URLS])];

const patchRes = await fetch(endpoint, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    site_url: SITE_URL,
    uri_allow_list: merged.join(","),
  }),
});

if (!patchRes.ok) {
  console.error("PATCH auth config failed:", patchRes.status, await patchRes.text());
  process.exit(1);
}

const updated = await patchRes.json();
console.log("Updated site_url:", updated.site_url);
console.log("Updated uri_allow_list:", updated.uri_allow_list);
console.log("Done — password reset and email confirm links will redirect to production.");
