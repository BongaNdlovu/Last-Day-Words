/** Expert-tier clues — cryptic, for players who need deeper challenge */
export const expertClueMap: Record<string, string> = {
  "signs-1": "Olivet discourse symptom: nations rise against nations before the end.",
  "signs-2": "Matthew 24 warns these deceivers may show wonders to mislead the elect.",
  "signs-3": "Hated of all nations for His name — Matthew 24:9 affliction.",
  "signs-4": "Must reach every nation as a witness — then the end arrives.",
  "shaking-1": "Hebrews 12:27 — only what cannot be shaken will remain.",
  "shaking-2": "Laodicean rebuke: 'As many as I love, I rebuke and chasten.'",
  "shaking-3": "They received not the love of the truth — 2 Thessalonians 2:10.",
  "shaking-4": "Amos 9:9 — sifted like corn; not one grain falls to the earth.",
  "latter-rain-1": "Joel 2:23 — former rain moderately, latter rain at harvest end.",
  "latter-rain-2": "Acts 2 — the early rain that launched the apostolic church.",
  "latter-rain-3": "Acts 3:19 — sins blotted out when refreshing comes from His presence.",
  "latter-rain-4": "Zechariah 10:1 — ask the LORD for rain in the time of the latter rain.",
  "loud-cry-1": "Revelation 18:1 — the earth lightened with His glory.",
  "loud-cry-2": "Revelation 14's threefold final warning of judgment and worship.",
  "loud-cry-3": "Second angel of Revelation 14 — great city fallen twice over.",
  "loud-cry-4": "Revelation 18:4 — leave before you share in her sins and plagues.",
  "seal-of-god-1": "Revelation 7:3 — sealed in the forehead before harm to earth.",
  "seal-of-god-2": "Ezekiel 20:12 — sign between God and His people as Creator.",
  "seal-of-god-3": "Legislated false worship day enforced by civil power.",
  "seal-of-god-4": "Revelation 13:17 — required for buying and selling.",
  "time-of-trouble-1": "Revelation 22:11 — character fixed; no mediator remains.",
  "time-of-trouble-2": "Daniel 12:1 — trouble such as never was since there was a nation.",
  "time-of-trouble-3": "Jeremiah 30:7 — Jacob's anguish, but saved out of it.",
  "time-of-trouble-4": "Revelation 13:15 — image speaks; refusers face execution.",
  "second-coming-1": "Titus 2:13 — the blessed hope and glorious appearing.",
  "second-coming-2": "Matthew 24:30 — sign of the Son of man seen in heaven's clouds.",
  "second-coming-3": "1 Thessalonians 4:16 — trumpet; dead in Christ rise first.",
  "second-coming-4": "1 Thessalonians 4:17 — living saints caught up to meet Him in the air.",
  "new-earth-1": "Revelation 12:17 — keep commandments and hold testimony of Jesus.",
  "new-earth-2": "Revelation 21:1 — first heaven and earth passed away.",
  "new-earth-3": "Revelation 21:2 — holy city prepared as a bride adorned.",
  "new-earth-4": "Revelation 21:4 — God wipes every tear; pain and death are gone.",
};

export function applyExpertClue<T extends { id: string; expertClue?: string }>(word: T): T {
  if (word.expertClue) return word;
  const expertClue = expertClueMap[word.id];
  return expertClue ? { ...word, expertClue } : word;
}
