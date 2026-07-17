/**
 * Regenerates supabase/migrations/20260717000000_sync_content_kjv_revamp.sql
 * from the CURRENT bundled TS content (all chapters + 380 words), so the remote
 * `chapters` / `season_chapters` / `words` tables match the app's bundled data
 * after the July 2026 verse-anchoring + KJV cleanup revamp.
 *
 * Idempotent: every statement is `insert ... on conflict do update`.
 * Run: npx tsx scripts/generate-content-sync-migration.ts
 */
import { writeFileSync } from "fs";
import { chaptersData } from "../src/data/words";
import { BUNDLED_SEASONS } from "../src/data/seasons";

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

const lines: string[] = [];
lines.push("-- Content sync: all chapters + 380 words from bundled TS data");
lines.push("-- (verse-anchored answers + canonical KJV scripture, 2026-07-17).");
lines.push("-- Idempotent upserts; safe to re-run.");
lines.push("");

// ---- chapters ----
lines.push("insert into public.chapters (id, title, description, sort_order, season_id) values");
lines.push(
  chaptersData
    .map((c, i) => {
      const sid = c.seasonId ? `'${esc(c.seasonId)}'` : "null";
      const comma = i === chaptersData.length - 1 ? "" : ",";
      return `  ('${esc(c.id)}', '${esc(c.title)}', '${esc(c.description)}', ${i}, ${sid})${comma}`;
    })
    .join("\n")
);
lines.push(
  "on conflict (id) do update set title = excluded.title, description = excluded.description, sort_order = excluded.sort_order, season_id = excluded.season_id;"
);
lines.push("");

// ---- season_chapters ----
const chapterIds = new Set(chaptersData.map((c) => c.id));
const seasonLinks: string[] = [];
for (const s of BUNDLED_SEASONS) {
  for (const cid of s.chapterIds) {
    if (chapterIds.has(cid)) seasonLinks.push(`  ('${esc(s.id)}', '${esc(cid)}')`);
  }
}
if (seasonLinks.length) {
  lines.push("insert into public.season_chapters (season_id, chapter_id) values");
  lines.push(seasonLinks.join(",\n"));
  lines.push("on conflict do nothing;");
  lines.push("");
}

// ---- words (batched) ----
const wordRows: string[] = [];
chaptersData.forEach((c) => {
  c.words.forEach((w, wi) => {
    const expert = w.expertClue ? `'${esc(w.expertClue)}'` : "null";
    wordRows.push(
      `  ('${esc(w.id)}', '${esc(c.id)}', '${esc(w.word)}', '${esc(w.clue)}', ${expert}, '${esc(w.verse)}', '${esc(w.scripture)}', '${esc(w.summary)}', ${wi})`
    );
  });
});

const batchSize = 25;
for (let i = 0; i < wordRows.length; i += batchSize) {
  const chunk = wordRows.slice(i, i + batchSize);
  lines.push(
    "insert into public.words (id, chapter_id, word, clue, expert_clue, verse, scripture, summary, sort_order) values"
  );
  lines.push(chunk.join(",\n"));
  lines.push(
    "on conflict (id) do update set chapter_id = excluded.chapter_id, word = excluded.word, clue = excluded.clue, expert_clue = excluded.expert_clue, verse = excluded.verse, scripture = excluded.scripture, summary = excluded.summary, sort_order = excluded.sort_order;"
  );
  lines.push("");
}

const outPath = "supabase/migrations/20260717000000_sync_content_kjv_revamp.sql";
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath} — ${chaptersData.length} chapters, ${wordRows.length} words`);
