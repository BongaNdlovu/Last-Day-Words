# RESEARCH_LOG — Last Day Words retention features

### Question definition

```
QUESTION(S):
  1) Which verified KJV / Education / Great Controversy passages fit mastery-tier
     unlocks, perfect-solve scripture bonuses, and mystery-fragment study content
     for the existing 10 chapters / 40 prophetic terms?
  2) Confirm Supabase free-tier Auth + Realtime + Postgres patterns for email/password
     auth, display names, room codes, and weekly leaderboards (as of 2026-07).
  3) Confirm vite-plugin-pwa + Web Notification / service-worker approach for
     installable PWA + streak-at-risk reminders.

SUFFICIENT ANSWER:
  A ledger of cited passages (book, chapter/page or verse) usable in-app without
  inventing EGW/KJV wording; plus verified setup notes for Supabase + PWA.

FRESHNESS REQUIRED:
  Supabase/PWA: current as of 2026-07. Scripture/EGW: historical texts OK.

KNOWN UNKNOWNS:
  Exact PDF pagination vs print editions; Cloudflare Pages project not created yet.

OUT OF SCOPE:
  Paywalled EGW editions; inventing EGW quotes; service_role in client.

DATE STARTED: 2026-07-09
```

### Claims ledger

| # | Claim | Source (URL + locator) | Tier | Info date | Corroborated by | Grade |
|---|-------|------------------------|------|-----------|-----------------|-------|
| 1 | Education: “Our ideas of education take too narrow…” | en_Ed (1).pdf p12 | primary | 1903 / PDF 2017 | EGW Estate PDF extract 2026-07-09 | VERIFIED |
| 2 | Education: “Higher than the highest human thought…” | en_Ed (1).pdf p16 | primary | 1903 | same PDF extract | VERIFIED |
| 3 | Education: Bible study miner metaphor | en_Ed (1).pdf p152 | primary | 1903 | same PDF extract | VERIFIED |
| 4 | GC: second advent “keynote of the Sacred Scriptures” | en_GC (1).pdf p260 | primary | GC text | same PDF extract | VERIFIED |
| 5 | GC: former rain / latter rain close of gospel | en_GC (1).pdf p524 | primary | GC text | same PDF extract | VERIFIED |
| 6 | GC: seal of God vs mark of the beast | en_GC (1).pdf p519 | primary | GC text | same PDF extract | VERIFIED |
| 7 | GC: time of trouble / Dan 12:1 quoted | en_GC (1).pdf p525 | primary | GC text | same PDF extract | VERIFIED |
| 8 | GC: Rev 18 loud cry / come out of her | en_GC (1).pdf p517 | primary | GC text | same PDF extract | VERIFIED |
| 9 | GC: sanctuary key to 1844 | en_GC (1).pdf p365 | primary | GC text | same PDF extract | VERIFIED |
| 10 | GC: investigative judgment of professed people of God | en_GC (1).pdf p413 | primary | GC text | same PDF extract | VERIFIED |
| 11 | GC: image of the Roman hierarchy (US churches + state) | en_GC (1).pdf p383 | primary | GC text | same PDF extract | VERIFIED |
| 12 | GC: Protestants admit no Scriptural authority for Sabbath change | en_GC (1).pdf p385 | primary | GC text | same PDF extract | VERIFIED |
| 13 | Supabase email/password signUp API | https://supabase.com/docs/reference/javascript/auth-signup accessed 2026-07-09 | primary | 2026 | https://supabase.com/docs/guides/auth/passwords | VERIFIED |
| 14 | vite-plugin-pwa registerType autoUpdate | https://vite-pwa-org.netlify.app/guide/ accessed 2026-07-09 | primary | 2026 | npm vite-plugin-pwa install | VERIFIED |
| 15 | KJV phrases for Matt 24:6, Joel 2:28, Rev 14:12, Rev 7:3, Dan 8:14, Rev 18:4, Heb 12:27, Isa 58:13, 2 Tim 2:15, Hab 2:2, Rev 3:11, James 5:7 | kjv.pdf pages 2286, 1738, 2768, 2756, 1706, 2775, 2703, 1449, 2673, 1777, 2751, 2713 | primary | KJV | Matches in-app / studyContent wording (scan completed 2026-07-09) | VERIFIED |

### Search trail (including dead ends)

| Query / tactic | Where | Result (found what / nothing new) |
|----------------|-------|-----------------------------------|
| Locate deep-research skill | local filesystem | Found at rhema-main/.agents/skills/deep-research |
| PDF path check | Downloads | en_Ed (1).pdf, en_GC (1).pdf, kjv.pdf present |
| pypdf phrase search Education | en_Ed (1).pdf | Ch.1 + Bible Teaching extracts |
| pypdf phrase search GC | en_GC (1).pdf | latter rain, seal, judgment, time of trouble, Rev 18 |
| Full KJV phrase scan | kjv.pdf | All 12 target phrases found; ledger #15 upgraded to VERIFIED |
| Supabase auth docs | supabase.com docs | signUp + passwords guides opened |
| vite-plugin-pwa guide | vite-pwa-org.netlify.app | autoUpdate + generateSW confirmed |

### Conflicts noticed

```
None material. OCR in PDFs replaces apostrophes with �; in-app quotes normalized to ASCII apostrophes with ellipses for omissions — labeled as extracts, not invented wording.
```

---

# Dossier — Verified study content for Last Day Words unlocks
Researched: 2026-07-09 · Shelf life: EGW/KJV historical (stable); Supabase/PWA APIs recheck if upgrading major versions

## 1 · Direct answer
Enough verified Education + Great Controversy passages were extracted from the user PDFs to populate mastery unlocks, perfect-solve bonuses, and 10 mystery fragments without inventing EGW wording. Confidence: HIGH for EGW extracts and for the 12 KJV phrases corroborated in kjv.pdf.

## 2 · Key findings (ranked by confidence)
- **FACT** EGW Education ch.1 and ch.20 passages exist at the cited PDF pages [ledger 1–3].
- **FACT** GC passages on second advent, latter rain, seal, loud cry (Rev 18), sanctuary/judgment, and Sunday/image themes exist at cited pages [ledger 4–12].
- **FACT** Supabase JS `auth.signUp` / password auth and vite-plugin-pwa `autoUpdate` are current documented APIs [ledger 13–14].
- **INFERENCE** Based on ledger 1–12, chapter-themed unlock mapping in `src/data/studyContent.ts` is appropriate for this game’s 10 chapters.
- **FACT** Twelve load-bearing KJV phrases used in unlocks/UI were found in kjv.pdf at the cited pages [ledger 15].

## 3 · Disputed & conflicting
None.

## 4 · Gaps — what could not be verified
- Not every scripture string in `words.ts` was exhaustively re-scanned against kjv.pdf — only the 12 phrases listed in ledger #15.
- Exact print-edition page numbers vs PDF page indices may differ by front-matter offset; locators use PDF page numbers from pypdf.

## 5 · Detail sections
See `src/data/studyContent.ts` for the passages wired into the app.

## 6 · Sources
- [S1] Education — Ellen G. White — local `en_Ed (1).pdf` — EGW Estate 2017 — accessed 2026-07-09 — primary
- [S2] The Great Controversy — Ellen G. White — local `en_GC (1).pdf` — accessed 2026-07-09 — primary
- [S3] King James Version — local `kjv.pdf` — accessed 2026-07-09 — primary (partial scan)
- [S4] Supabase Auth signUp — https://supabase.com/docs/reference/javascript/auth-signup — accessed 2026-07-09
- [S5] Vite PWA Getting Started — https://vite-pwa-org.netlify.app/guide/ — accessed 2026-07-09
