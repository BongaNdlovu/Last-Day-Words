/**
 * Verified study passages for mastery unlocks, perfect-solve bonuses,
 * and mystery-fragment rewards.
 *
 * Every EGW quotation was extracted this session from the user-supplied PDFs:
 *   - en_Ed (1).pdf  (Education, 1903 / EGW Estate 2017)
 *   - en_GC (1).pdf  (The Great Controversy)
 * KJV verses reuse the in-app scripture fields already tied to chapter terms,
 * cross-checked against kjv.pdf where the extract completed.
 *
 * See RESEARCH_LOG.md for ledger rows and PDF page locators.
 */

export type StudySource = "kjv" | "education" | "great-controversy";

export interface StudyPassage {
  id: string;
  source: StudySource;
  citation: string;
  /** Exact or near-exact extract; ellipses mark omitted mid-sentence material. */
  text: string;
  locator: string;
}

/** Chapter mastery unlocks: one passage per tier (25 / 50 / 100). */
export const CHAPTER_MASTERY_UNLOCKS: Record<
  string,
  Partial<Record<25 | 50 | 100, StudyPassage>>
> = {
  signs: {
    25: {
      id: "signs-25",
      source: "great-controversy",
      citation: "The Great Controversy, p. 299 (ch. 17)",
      text: "One of the most solemn and yet most glorious truths revealed in the Bible is that of Christ's second coming to complete the great work of redemption.",
      locator: "en_GC (1).pdf p260",
    },
    50: {
      id: "signs-50",
      source: "kjv",
      citation: "Matthew 24:6 (KJV)",
      text: "And ye shall hear of wars and rumours of wars: see that ye be not troubled: for all these things must come to pass, but the end is not yet.",
      locator: "src/data/words.ts signs-1 + kjv.pdf",
    },
    100: {
      id: "signs-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 299 (ch. 17)",
      text: "The doctrine of the second advent is the very keynote of the Sacred Scriptures. From the day when the first pair turned their sorrowing steps from Eden, the children of faith have waited the coming of the Promised One to break the destroyer's power and bring them again to the lost Paradise.",
      locator: "en_GC (1).pdf p260",
    },
  },
  shaking: {
    25: {
      id: "shaking-25",
      source: "kjv",
      citation: "Hebrews 12:27 (KJV)",
      text: "And this word, Yet once more, signifieth the removing of those things that are shaken, as of things that are made, that those things which cannot be shaken may remain.",
      locator: "src/data/words.ts shaking-1",
    },
    50: {
      id: "shaking-50",
      source: "education",
      citation: "Education, p. 148 (ch. 20)",
      text: "The study of the Bible demands our most diligent effort and persevering thought. As the miner digs for the golden treasure in the earth, so earnestly, persistently, must we seek for the treasure of God's word.",
      locator: "en_Ed (1).pdf p152",
    },
    100: {
      id: "shaking-100",
      source: "kjv",
      citation: "Revelation 3:19 (KJV)",
      text: "As many as I love, I rebuke and chasten: be zealous therefore, and repent.",
      locator: "src/data/words.ts shaking-2",
    },
  },
  "latter-rain": {
    25: {
      id: "lr-25",
      source: "kjv",
      citation: "Joel 2:23 (KJV)",
      text: "Be glad then, ye children of Zion, and rejoice in the LORD your God: for he hath given you the former rain moderately, and he will cause to come down for you the rain, the former rain, and the latter rain in the first month.",
      locator: "src/data/words.ts latter-rain-1",
    },
    50: {
      id: "lr-50",
      source: "great-controversy",
      citation: "The Great Controversy, pp. 611–612 (ch. 38)",
      text: "The great work of the gospel is not to close with less manifestation of the power of God than marked its opening. The prophecies which were fulfilled in the outpouring of the former rain at the opening of the gospel are again to be fulfilled in the latter rain at its close.",
      locator: "en_GC (1).pdf p524",
    },
    100: {
      id: "lr-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 612 (ch. 38)",
      text: "Here are \"the times of refreshing\" to which the apostle Peter looked forward when he said: \"Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord.\"",
      locator: "en_GC (1).pdf p524",
    },
  },
  "loud-cry": {
    25: {
      id: "lc-25",
      source: "kjv",
      citation: "Revelation 18:1, 4 (KJV)",
      text: "And after these things I saw another angel come down from heaven, having great power; and the earth was lightened with his glory. … And I heard another voice from heaven, saying, Come out of her, my people, that ye be not partakers of her sins, and that ye receive not of her plagues.",
      locator: "en_GC (1).pdf p517 (quotes Rev 18)",
    },
    50: {
      id: "lc-50",
      source: "great-controversy",
      citation: "The Great Controversy, p. 603 (ch. 38)",
      text: "This scripture points forward to a time when the announcement of the fall of Babylon, as made by the second angel of Revelation 14 (verse 8), is to be repeated, with the additional mention of the corruptions which have been entering the various organizations that constitute Babylon, since that message was first given, in the summer of 1844.",
      locator: "en_GC (1).pdf p517",
    },
    100: {
      id: "lc-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 603 (ch. 38)",
      text: "\"I saw another angel come down from heaven, having great power; and the earth was lightened with his glory.\" … \"Come out of her, My people, that ye be not partakers of her sins, and that ye receive not of her plagues.\" Revelation 18:1, 2, 4.",
      locator: "en_GC (1).pdf p517",
    },
  },
  "seal-of-god": {
    25: {
      id: "seal-25",
      source: "kjv",
      citation: "Revelation 14:12 (KJV)",
      text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
      locator: "src/data/words.ts seal-of-god terms",
    },
    50: {
      id: "seal-50",
      source: "great-controversy",
      citation: "The Great Controversy, p. 605 (ch. 38)",
      text: "While one class, by accepting the sign of submission to earthly powers, receive the mark of the beast, the other choosing the token of allegiance to divine authority, receive the seal of God.",
      locator: "en_GC (1).pdf p519",
    },
    100: {
      id: "seal-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 605 (ch. 38)",
      text: "…the keeping of the true Sabbath, in obedience to God's law, is an evidence of loyalty to the Creator.",
      locator: "en_GC (1).pdf p519",
    },
  },
  "time-of-trouble": {
    25: {
      id: "tot-25",
      source: "kjv",
      citation: "Daniel 12:1 (KJV)",
      text: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation even to that same time: and at that time thy people shall be delivered, every one that shall be found written in the book.",
      locator: "en_GC (1).pdf p525 (quotes Dan 12:1)",
    },
    50: {
      id: "tot-50",
      source: "great-controversy",
      citation: "The Great Controversy, p. 594 (ch. 37)",
      text: "The events connected with the close of probation and the work of preparation for the time of trouble, are clearly presented. But multitudes have no more understanding of these important truths than if they had never been revealed. … and the time of trouble will find them unready.",
      locator: "en_GC (1).pdf p510",
    },
    100: {
      id: "tot-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 613 (ch. 39)",
      text: "When the third angel's message closes, mercy no longer pleads for the guilty inhabitants of the earth. The people of God have accomplished their work. They have received \"the latter rain,\" \"the refreshing from the presence of the Lord,\" and they are prepared for the trying hour before them.",
      locator: "en_GC (1).pdf p525",
    },
  },
  "second-coming": {
    25: {
      id: "sc-25",
      source: "great-controversy",
      citation: "The Great Controversy, p. 299 (ch. 17)",
      text: "One of the most solemn and yet most glorious truths revealed in the Bible is that of Christ's second coming to complete the great work of redemption.",
      locator: "en_GC (1).pdf p260",
    },
    50: {
      id: "sc-50",
      source: "great-controversy",
      citation: "The Great Controversy, p. 299 (ch. 17)",
      text: "The doctrine of the second advent is the very keynote of the Sacred Scriptures.",
      locator: "en_GC (1).pdf p260",
    },
    100: {
      id: "sc-100",
      source: "education",
      citation: "Education, p. 13 (ch. 1)",
      text: "Our ideas of education take too narrow and too low a range. There is need of a broader scope, a higher aim. True education means more than the pursual of a certain course of study. … It prepares the student for the joy of service in this world and for the higher joy of wider service in the world to come.",
      locator: "en_Ed (1).pdf p12",
    },
  },
  "new-earth": {
    25: {
      id: "ne-25",
      source: "kjv",
      citation: "Revelation 21:1 (KJV)",
      text: "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.",
      locator: "src/data/words.ts new-earth-1",
    },
    50: {
      id: "ne-50",
      source: "education",
      citation: "Education, p. 15 (ch. 1)",
      text: "To restore in man the image of his Maker, to bring him back to the perfection in which he was created, to promote the development of body, mind, and soul, that the divine purpose in his creation might be realized—this was to be the work of redemption. This is the object of education, the great object of life.",
      locator: "en_Ed (1).pdf p14",
    },
    100: {
      id: "ne-100",
      source: "education",
      citation: "Education, p. 18 (ch. 1)",
      text: "Higher than the highest human thought can reach is God's ideal for His children. Godliness—godlikeness—is the goal to be reached.",
      locator: "en_Ed (1).pdf p16",
    },
  },
  judgment: {
    25: {
      id: "j-25",
      source: "kjv",
      citation: "Daniel 8:14 (KJV)",
      text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
      locator: "src/data/words.ts judgment-2",
    },
    50: {
      id: "j-50",
      source: "great-controversy",
      citation: "The Great Controversy, p. 423 (ch. 24)",
      text: "The subject of the sanctuary was the key which unlocked the mystery of the disappointment of 1844. It opened to view a complete system of truth, connected and harmonious, showing that God's hand had directed the great advent movement…",
      locator: "en_GC (1).pdf p365",
    },
    100: {
      id: "j-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 480 (ch. 28)",
      text: "In the great day of final atonement and investigative judgment the only cases considered are those of the professed people of God. The judgment of the wicked is a distinct and separate work, and takes place at a later period.",
      locator: "en_GC (1).pdf p413",
    },
  },
  deceptions: {
    25: {
      id: "d-25",
      source: "kjv",
      citation: "2 Thessalonians 2:11 (KJV)",
      text: "And for this cause God shall send them strong delusion, that they should believe a lie.",
      locator: "src/data/words.ts deceptions-1",
    },
    50: {
      id: "d-50",
      source: "great-controversy",
      citation: "The Great Controversy, pp. 445–448 (ch. 25)",
      text: "When the leading churches of the United States, uniting upon such points of doctrine as are held by them in common, shall influence the state to enforce their decrees and to sustain their institutions, then Protestant America will have formed an image of the Roman hierarchy…",
      locator: "en_GC (1).pdf p383",
    },
    100: {
      id: "d-100",
      source: "great-controversy",
      citation: "The Great Controversy, p. 448 (ch. 25)",
      text: "It is a fact generally admitted by Protestants that the Scriptures give no authority for the change of the Sabbath.",
      locator: "en_GC (1).pdf p385",
    },
  },
};

/** Pool for random “Scripture bonus” after a perfect (3★) solve. */
export const PERFECT_SOLVE_BONUSES: StudyPassage[] = [
  CHAPTER_MASTERY_UNLOCKS.signs![100]!,
  CHAPTER_MASTERY_UNLOCKS["latter-rain"]![50]!,
  CHAPTER_MASTERY_UNLOCKS["seal-of-god"]![50]!,
  CHAPTER_MASTERY_UNLOCKS.judgment![50]!,
  CHAPTER_MASTERY_UNLOCKS["time-of-trouble"]![100]!,
  CHAPTER_MASTERY_UNLOCKS["loud-cry"]![50]!,
  {
    id: "bonus-ed-bible",
    source: "education",
    citation: "Education, p. 148 (ch. 20)",
    text: "The study of the Bible demands our most diligent effort and persevering thought. As the miner digs for the golden treasure in the earth, so earnestly, persistently, must we seek for the treasure of God's word.",
    locator: "en_Ed (1).pdf p152",
  },
  {
    id: "bonus-ed-aim",
    source: "education",
    citation: "Education, p. 13 (ch. 1)",
    text: "True education means more than the pursual of a certain course of study. It means more than a preparation for the life that now is. It has to do with the whole being, and with the whole period of existence possible to man.",
    locator: "en_Ed (1).pdf p12",
  },
];

/** Mystery fragments: collect 10 unique pieces → unlock bonus study. */
export const MYSTERY_FRAGMENTS: StudyPassage[] = [
  {
    id: "frag-1",
    source: "education",
    citation: "Education, p. 14 (ch. 1)",
    text: "In a knowledge of God all true knowledge and real development have their source.",
    locator: "en_Ed (1).pdf p13",
  },
  {
    id: "frag-2",
    source: "education",
    citation: "Education, p. 16 (ch. 1)",
    text: "The Holy Scriptures are the perfect standard of truth, and as such should be given the highest place in education.",
    locator: "en_Ed (1).pdf p15",
  },
  {
    id: "frag-3",
    source: "great-controversy",
    citation: "The Great Controversy, p. 299",
    text: "The doctrine of the second advent is the very keynote of the Sacred Scriptures.",
    locator: "en_GC (1).pdf p260",
  },
  {
    id: "frag-4",
    source: "great-controversy",
    citation: "The Great Controversy, p. 612",
    text: "The prophecies which were fulfilled in the outpouring of the former rain at the opening of the gospel are again to be fulfilled in the latter rain at its close.",
    locator: "en_GC (1).pdf p524",
  },
  {
    id: "frag-5",
    source: "great-controversy",
    citation: "The Great Controversy, p. 605",
    text: "…the other choosing the token of allegiance to divine authority, receive the seal of God.",
    locator: "en_GC (1).pdf p519",
  },
  {
    id: "frag-6",
    source: "great-controversy",
    citation: "The Great Controversy, p. 613",
    text: "When the third angel's message closes, mercy no longer pleads for the guilty inhabitants of the earth.",
    locator: "en_GC (1).pdf p525",
  },
  {
    id: "frag-7",
    source: "great-controversy",
    citation: "The Great Controversy, p. 423",
    text: "The subject of the sanctuary was the key which unlocked the mystery of the disappointment of 1844.",
    locator: "en_GC (1).pdf p365",
  },
  {
    id: "frag-8",
    source: "great-controversy",
    citation: "The Great Controversy, p. 603",
    text: "\"Come out of her, My people, that ye be not partakers of her sins, and that ye receive not of her plagues.\" Revelation 18:4.",
    locator: "en_GC (1).pdf p517",
  },
  {
    id: "frag-9",
    source: "kjv",
    citation: "Habakkuk 2:2 (KJV)",
    text: "And the LORD answered me, and said, Write the vision, and make it plain upon tables, that he may run that readeth it.",
    locator: "app footer / kjv.pdf",
  },
  {
    id: "frag-10",
    source: "education",
    citation: "Education, p. 18 (ch. 1)",
    text: "Higher than the highest human thought can reach is God's ideal for His children. Godliness—godlikeness—is the goal to be reached.",
    locator: "en_Ed (1).pdf p16",
  },
];

export const FRAGMENTS_NEEDED = 10;

export function pickPerfectBonus(excludeIds: string[] = []): StudyPassage {
  const pool = PERFECT_SOLVE_BONUSES.filter((p) => !excludeIds.includes(p.id));
  const list = pool.length > 0 ? pool : PERFECT_SOLVE_BONUSES;
  return list[Math.floor(Math.random() * list.length)];
}

export function pickMysteryFragment(ownedIds: string[]): StudyPassage | null {
  const remaining = MYSTERY_FRAGMENTS.filter((f) => !ownedIds.includes(f.id));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}
