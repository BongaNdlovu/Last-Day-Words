# RESEARCH_LOG — Last Day Words

Research and verification log for study content, word catalog expansion,
Supabase, and PWA. Last reviewed: 2026-07-10.

## Question definition

```text
QUESTION(S):
  1) Which verified KJV / Education / Great Controversy passages fit
     mastery-tier unlocks, perfect-solve bonuses, and mystery-fragment
     study content (originally scoped to the first core chapters)?
  2) Confirm Supabase Auth + Realtime + Postgres patterns for
     email/password auth, display names, room codes, and weekly
     leaderboards (as of 2026-07).
  3) Confirm vite-plugin-pwa + Web Notification / service-worker approach
     for installable PWA + streak-at-risk reminders.
  4) (Added) Expand and KJV-verify the word catalog (batch-1 + batch-2)
     without inventing verse wording.

SUFFICIENT ANSWER:
  A ledger of cited passages usable in-app without inventing EGW/KJV
  wording; verified Supabase + PWA setup notes; expansion ledgers under
  docs/ with KJV verify substrings.

FRESHNESS REQUIRED:
  Supabase/PWA: current as of 2026-07.
  Scripture/EGW: historical texts OK.

KNOWN UNKNOWNS:
  Exact PDF pagination vs print editions (locators use pypdf page indices).

OUT OF SCOPE:
  Paywalled EGW editions; inventing EGW quotes; service_role in client.

DATE STARTED: 2026-07-09
DATE LAST UPDATED: 2026-07-10
```

## Current catalog snapshot (post batch-2)

| Metric | Value |
| --- | --- |
| Chapters | 76 |
| Words | 380 |
| Core + expansion-1 + batch-2 | 80 + 150 + 150 (incl. 20 top-ups) |
| Client snapshot | `src/data/words.ts` + expansions |
| Full DB seed | `supabase/seed_content.sql` |

## Claims ledger

### EGW Education (`en_Ed (1).pdf`)

- **1.** **Claim:** “Our ideas of education take too narrow…”
  - **Source:** en_Ed (1).pdf p12 · primary · 1903 / PDF 2017
  - **Corroborated:** EGW Estate PDF extract 2026-07-09 · **VERIFIED**

- **2.** **Claim:** “Higher than the highest human thought…”
  - **Source:** en_Ed (1).pdf p16 · primary · 1903
  - **Corroborated:** same PDF extract · **VERIFIED**

- **3.** **Claim:** Bible study miner metaphor
  - **Source:** en_Ed (1).pdf p152 · primary · 1903
  - **Corroborated:** same PDF extract · **VERIFIED**

### EGW Great Controversy (`en_GC (1).pdf`)

- **4.** **Claim:** Second advent “keynote of the Sacred Scriptures”
  - **Source:** en_GC (1).pdf p260 · **VERIFIED** 2026-07-09

- **5.** **Claim:** Former rain / latter rain close of gospel
  - **Source:** en_GC (1).pdf p524 · **VERIFIED**

- **6.** **Claim:** Seal of God vs mark of the beast
  - **Source:** en_GC (1).pdf p519 · **VERIFIED**

- **7.** **Claim:** Time of trouble / Dan 12:1 quoted
  - **Source:** en_GC (1).pdf p525 · **VERIFIED**

- **8.** **Claim:** Rev 18 loud cry / come out of her
  - **Source:** en_GC (1).pdf p517 · **VERIFIED**

- **9.** **Claim:** Sanctuary key to 1844
  - **Source:** en_GC (1).pdf p365 · **VERIFIED**

- **10.** **Claim:** Investigative judgment of professed people of God
  - **Source:** en_GC (1).pdf p413 · **VERIFIED**

- **11.** **Claim:** Image of the Roman hierarchy (US churches + state)
  - **Source:** en_GC (1).pdf p383 · **VERIFIED**

- **12.** **Claim:** Protestants admit no Scriptural authority for Sabbath change
  - **Source:** en_GC (1).pdf p385 · **VERIFIED**

### Platform docs

- **13.** **Claim:** Supabase email/password signUp API
  - **Source:**
      [Auth signUp reference](https://supabase.com/docs/reference/javascript/auth-signup)
      (accessed 2026-07-09)
  - **Corroborated:**
      [Password auth guide](https://supabase.com/docs/guides/auth/passwords)
  - **Grade:** VERIFIED

- **14.** **Claim:** vite-plugin-pwa `registerType: 'autoUpdate'`
  - **Source:**
      [Vite PWA guide](https://vite-pwa-org.netlify.app/guide/)
      (accessed 2026-07-09)
  - **In-app config:** `vite.config.ts` uses
      `strategies: 'injectManifest'` (custom `src/sw.ts`), **not**
      `generateSW`
  - **Grade:** VERIFIED (API) — corrected 2026-07-10 for strategy name

### KJV (core tracks)

- **15.** **Claim:** Load-bearing KJV phrases for unlocks/UI
    (Matt 24:6, Joel 2:28, Rev 14:12, Rev 7:3, Dan 8:14, Rev 18:4,
    Heb 12:27, Isa 58:13, 2 Tim 2:15, Hab 2:2, Rev 3:11, James 5:7)
  - **Source:** kjv.pdf (pypdf pages noted in original scan)
  - **Grade:** VERIFIED 2026-07-09

- **16.** **Claim:** Daniel 2 image track KJV (`daniel-image-*`)
  - **Source:** Public-domain KJV · **VERIFIED**

- **17.** **Claim:** Daniel 7 beasts / little horn KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **18.** **Claim:** Daniel 8 sanctuary KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **19.** **Claim:** Daniel 12 Michael stands KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **20.** **Claim:** Revelation churches track KJV
    (`rev-churches-*`: 1:11, 2:4, 3:8, **3:14** for Laodicea)
  - **Source:** Public-domain KJV · in-app `rev-churches-3` uses
      **Revelation 3:14** (not 3:16 lukewarm-only verse)
  - **Grade:** VERIFIED — verse id corrected 2026-07-10

- **21.** **Claim:** Revelation seals KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **22.** **Claim:** Revelation trumpets KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **23.** **Claim:** Revelation beast system KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **24.** **Claim:** Revelation millennium KJV
  - **Source:** Public-domain KJV · **VERIFIED**

- **25.** **Claim:** GC sanctuary key + hierarchy image reused for mastery tiers
  - **Source:** en_GC (1).pdf p365, p383 · **VERIFIED**

### Expansion catalog

- **26.** **Claim:** Expansion batch-1 — 150 terms / 30 chapters, each
    `verify_substring` found in kjv.pdf
  - **Ledger:** `docs/expansion-research-ledger.json`
  - **Generator:** `scripts/build-word-expansion.py`
  - **Grade:** VERIFIED 2026-07-09 (later phrase-accuracy pass
      rewrote many answer strings to contiguous KJV; see batch fix log)

- **27.** **Claim:** Expansion batch-2 — 150 terms (20 top-ups + 26×5 new
    chapters); catalog **380 words / 76 chapters**
  - **Ledger:** `docs/expansion-batch2-ledger.json`
  - **Generator:** `scripts/build-expansion-batch2.py`
  - **Migration:**
      `supabase/migrations/20260710120000_seed_batch2_content.sql`
  - **Grade:** VERIFIED 2026-07-10

- **28.** **Claim:** Full multi-word game answers (non-study terms)
    contiguous in KJV after accuracy audit
  - **Reports:** `docs/WORD_AUDIT_REPORT.md`,
      `docs/word-audit-findings.json`
  - **Grade:** VERIFIED 2026-07-10

- **29.** **Claim:** EGW study passages in `studyContent.ts` match GC/Education
    PDF extracts (one KJV apostrophe false positive on Daniel 7:4)
  - **Report:** `docs/STUDY_FUNFACTS_AUDIT_REPORT.md`
  - **Grade:** VERIFIED 2026-07-10

## Expansion word research (batch-1, 2026-07-09)

Protocol: deep-research style — HS-1 (KJV primary), HS-3 (verify before ship).

| Metric | Value |
| --- | --- |
| New chapters | 30 |
| New words | 150 |
| Catalog after batch-1 | 230 words / 50 chapters |
| Verification source | local `kjv.pdf` |
| Ledger | `docs/expansion-research-ledger.json` |
| Generator | `scripts/build-word-expansion.py` |

Themes added: Daniel 3/5/6/9/10; Exodus/Leviticus/Hebrews sanctuary;
Isaiah; Joel; Zechariah; Malachi; Matthew/Luke parables; Acts; Romans;
1 Corinthians; Ephesians; Thessalonians; 2 Peter; Revelation 4–22 tracks.

No duplicate `word` strings vs the original 80-term core catalog
(checked at build time).

## Expansion batch-2 (150 terms, 2026-07-10)

| Metric | Value |
| --- | --- |
| Top-ups into original chapters | 20 (each core track +1 word) |
| New chapters | 26 × 5 words = 130 |
| New words total | 150 |
| Catalog after batch-2 | **380 words / 76 chapters** |
| Verification source | `kjv.pdf` (contiguous answers); GC themes |
| Ledger | `docs/expansion-batch2-ledger.json` |
| Generator | `scripts/build-expansion-batch2.py` |
| Migration | `20260710120000_seed_batch2_content.sql` |

Study/fun-facts audit:
`docs/STUDY_FUNFACTS_AUDIT_REPORT.md`
(EGW GC + Education PDFs + fun facts wording fixes).

## Search trail (including dead ends)

| Query / tactic | Where | Result |
| --- | --- | --- |
| Locate deep-research skill | local FS | rhema-main skills |
| PDF path check | Downloads | en_Ed, en_GC, kjv.pdf present |
| pypdf Education | en_Ed (1).pdf | Ch.1 + Bible Teaching extracts |
| pypdf GC | en_GC (1).pdf | latter rain, seal, judgment, Rev 18 |
| Full KJV phrase scan | kjv.pdf | Ledger #15 phrases found |
| Later full catalog audit | kjv.pdf + scripts | 380 terms KJV-contiguous |
| Supabase auth docs | supabase.com | signUp + passwords guides |
| vite-plugin-pwa guide | vite-pwa-org | autoUpdate; injectManifest |

## Conflicts noticed

```text
None material on doctrine.

PDF OCR often turns apostrophes into replacement characters; in-app
quotes use ASCII apostrophes and ellipses for omissions — labeled as
extracts, not invented wording.

Corrected contradictions (2026-07-10):
  - PWA strategy is injectManifest, not generateSW.
  - Laodicea answer verse is Revelation 3:14, not 3:16 alone.
  - Catalog size is 380/76 after batch-2, not 10×4 or 230/50 only.
```

---

## Dossier — Verified study content for unlocks

Researched: 2026-07-09 · Updated: 2026-07-10

Shelf life: EGW/KJV historical (stable); recheck Supabase/PWA APIs on
major version upgrades.

### 1 · Direct answer

Enough verified Education + Great Controversy passages were extracted from
the user PDFs to populate mastery unlocks, perfect-solve bonuses, and
10 mystery fragments without inventing EGW wording.

The word catalog later grew to **380 KJV-grounded terms / 76 chapters**
via two expansion batches plus accuracy audits.

Confidence: **HIGH** for EGW extracts, core KJV phrases, and post-audit
expansion answers.

### 2 · Key findings (ranked by confidence)

- **FACT** EGW Education ch.1 and ch.20 passages exist at the cited PDF
  pages [ledger 1–3].
- **FACT** GC passages on second advent, latter rain, seal, loud cry
  (Rev 18), sanctuary/judgment, and Sunday/image themes exist at cited
  pages [ledger 4–12].
- **FACT** Supabase JS `auth.signUp` / password auth and vite-plugin-pwa
  `autoUpdate` are documented APIs [ledger 13–14]; the app SW strategy is
  `injectManifest`.
- **INFERENCE** Chapter-themed unlock mapping in `src/data/studyContent.ts`
  fits the **original core chapter set** (signs through deceptions and
  Daniel/Revelation tracks present when study content was authored).
  Not every later expansion chapter has dedicated mastery tiers yet.
- **FACT** Twelve load-bearing KJV phrases used in early unlocks/UI were
  found in kjv.pdf [ledger 15].
- **FACT** Full catalog audits (2026-07-10) re-checked multi-word answers
  against kjv.pdf and EGW study strings against GC/Education PDFs
  [ledger 28–29].

### 3 · Disputed and conflicting

None material after 2026-07-10 corrections above.

### 4 · Gaps — what is still limited

- Mastery unlock passages in `studyContent.ts` still focus on the
  **original** chapter ids; many batch-1/batch-2 chapters have no
  dedicated mastery tier entries.
- Print-edition page numbers may differ from PDF page indices used in
  locators (pypdf).
- Fun facts are documented Adventist/Bible statements, not PDF
  verse-extracts; they were human-reviewed 2026-07-10.

### 5 · Detail sections

- Passages: `src/data/studyContent.ts`
- Word audits: `docs/WORD_AUDIT_REPORT.md`
- Study/fun facts: `docs/STUDY_FUNFACTS_AUDIT_REPORT.md`
- Remote Supabase: `docs/SUPABASE_REMOTE_WORKFLOW.md`

### 6 · Sources

- **[S1]** Education — Ellen G. White — local `en_Ed (1).pdf` —
  EGW Estate 2017 — accessed 2026-07-09 — primary
- **[S2]** The Great Controversy — Ellen G. White — local
  `en_GC (1).pdf` — accessed 2026-07-09 — primary
- **[S3]** King James Version — local `kjv.pdf` — accessed 2026-07-09
  and re-audited 2026-07-10 — primary
- **[S4]** Supabase Auth signUp —
  [docs](https://supabase.com/docs/reference/javascript/auth-signup) —
  accessed 2026-07-09
- **[S5]** Vite PWA Getting Started —
  [guide](https://vite-pwa-org.netlify.app/guide/) —
  accessed 2026-07-09
