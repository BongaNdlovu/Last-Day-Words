/**
 * "Did you know?" fun facts shown as a variable reward after solving a word.
 *
 * NOTE: These are AI-authored and kept to broadly-documented Bible/prophecy/
 * Adventist-history statements. Please REVIEW for doctrinal/factual accuracy
 * before shipping — edit or replace freely.
 */
export const FUN_FACTS: string[] = [
  "The word “apocalypse” simply means “unveiling” or “revelation” in Greek.",
  "Daniel and Revelation are the Bible’s two great prophetic books, and they often share the same symbols.",
  "In Bible prophecy a “beast” commonly represents a kingdom or political power (Daniel 7:23).",
  "“Armageddon” is named only once in the Bible — Revelation 16:16.",
  "Revelation promises a special blessing to anyone who reads and keeps its words (Revelation 1:3).",
  "The seventh-day Sabbath is rooted in the creation week of Genesis 2:2–3.",
  "In prophecy, “waters” can symbolize peoples, nations, and tongues (Revelation 17:15).",
  "The number seven appears more than 50 times throughout the book of Revelation.",
  "A prophetic “day” is often read as a literal year, drawing on Numbers 14:34 and Ezekiel 4:6.",
  "The 2300-day prophecy of Daniel 8:14 is the longest time prophecy in the Bible.",
  "The New Jerusalem is described as a cube-shaped city in Revelation 21:16.",
  "Jesus said that no one knows the day or hour of His return (Matthew 24:36).",
  "The three angels’ messages of Revelation 14 are central to the Adventist mission.",
  "The “seal of God” in Revelation stands in contrast to the “mark of the beast.”",
  "Ellen G. White helped found the Seventh-day Adventist Church, formally organized in 1863.",
  "Adventist health work helped make Loma Linda, California one of the world’s longevity “Blue Zones.”",
  "“Babylon” in Revelation symbolizes end-time confusion, echoing the ancient city.",
  "The Bible’s closing promise is “Surely I come quickly” (Revelation 22:20).",
  "“Gospel” literally means “good news.”",
  "The Olivet discourse (Matthew 24) is Jesus’ own list of signs before His return.",
];

export function getRandomFunFact(): string {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
}
