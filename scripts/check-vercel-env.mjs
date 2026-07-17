import fs from "fs";

const path = ".vercel/.env.production.local";
if (!fs.existsSync(path)) {
  console.log(JSON.stringify({ file: path, present: false }));
  process.exit(1);
}

function parseValue(raw) {
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

function get(key) {
  const line = fs.readFileSync(path, "utf8").split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  return parseValue(line.slice(key.length + 1));
}

const url = get("VITE_SUPABASE_URL");
const anon = get("VITE_SUPABASE_ANON_KEY");

console.log(
  JSON.stringify({
    urlPresent: Boolean(url),
    urlLen: url?.length ?? 0,
    urlValid: Boolean(url && /^https:\/\/.+\.supabase\.co\/?$/i.test(url)),
    urlHasInnerQuotes: Boolean(url && /["']/.test(url)),
    anonPresent: Boolean(anon),
    anonLen: anon?.length ?? 0,
  })
);
