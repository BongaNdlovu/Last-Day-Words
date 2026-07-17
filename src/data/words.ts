import { applyExpertClue } from "./expertClues";
import { expansionChapters } from "./wordsExpansion";
import { expansionChapters2 } from "./wordsExpansion2";

export interface WordTerm {
  id: string;
  word: string;
  clue: string;
  expertClue?: string;
  verse: string;
  scripture: string;
  summary: string;
  /**
   * Explicit override for "complete the verse" classification. When omitted the
   * game auto-detects it (answer is a verbatim phrase inside `scripture`). Set to
   * `false` to suppress the verse-reference anchor even when the answer happens to
   * appear in the text; set to `true` to force it when the stored scripture is a
   * truncated fragment that doesn't contain the full answer.
   */
  quoteRecall?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: WordTerm[];
  /** Optional seasonal track id (daniel | revelation). */
  seasonId?: string;
}

const rawChaptersData: Chapter[] = [
  {
    id: "signs",
    title: "Signs of Christ's Return",
    description: "Discover the warnings and symptoms of a world preparing for the Second Advent.",
    words: [
      {
        id: "signs-1",
        word: "WARS AND RUMOURS OF WARS",
        clue: "Symptom of a troubled world preceding the Second Advent, mentioned in the Olivet discourse.",
        verse: "Matthew 24:6",
        scripture: "And ye shall hear of wars and rumours of wars: see that ye be not troubled: for all these things must come to pass, but the end is not yet.",
        summary: "As the end approaches, international conflicts and political instability serve as reminders that this world is temporary and the return of Christ is near."
      },
      {
        id: "signs-2",
        word: "FALSE PROPHETS",
        clue: "Deceivers who will arise to show great signs and wonders, attempting to mislead even the elect.",
        verse: "Matthew 24:24",
        scripture: "For there shall arise false Christs, and false prophets, and shall shew great signs and wonders; insomuch that, if it were possible, they shall deceive the very elect.",
        summary: "Spiritual deception will reach its climax before the end. The only safeguard against the delusions of the enemy is a deep, personal knowledge of God's Word."
      },
      {
        id: "signs-3",
        word: "PERSECUTION",
        clue: "The trial God's people will face for keeping His commandments and holding the testimony of Jesus.",
        verse: "Matthew 13:21",
        scripture: "Yet hath he not root in himself, but dureth for a while: for when tribulation or persecution ariseth because of the word, by and by he is offended.",
        summary: "Opposition from the world reveals the true character of our faith and purifies the church, preparing believers to stand in the final conflict."
      },
      {
        id: "signs-4",
        quoteRecall: false,
        word: "PREACHING THE GOSPEL",
        clue: "The ultimate gospel task that must be finished in all the world as a witness before the end.",
        verse: "Matthew 24:14",
        scripture: "And this gospel of the kingdom shall be preached in all the world for a witness unto all nations; and then shall the end come.",
        summary: "The end will not come until everyone has had a fair opportunity to hear and accept the message of salvation. We are called to cooperate in this great work."
      },
      {
        id: "signs-5",
        word: "NATION SHALL RISE AGAINST NATION",
        clue: "Jesus lists international conflict among signs of the end in the Olivet discourse.",
        verse: "Matthew 24:7",
        scripture: "For nation shall rise against nation, and kingdom against kingdom: and there shall be famines, and pestilences, and earthquakes, in divers places.",
        summary: "Global unrest is a solemn reminder that history moves toward the promised return of Christ."
      },
    ]
  },
  {
    id: "shaking",
    title: "The Shaking",
    description: "Examine the great sifting process within the church as truth and error collide.",
    words: [
      {
        id: "shaking-1",
        quoteRecall: false,
        word: "SHAKING",
        clue: "A testing time among God's people where the superficial are separated from the faithful.",
        verse: "Hebrews 12:27",
        scripture: "And this word, Yet once more, signifieth the removing of those things that are shaken, as of things that are made, that those things which cannot be shaken may remain.",
        summary: "A great sifting occurs as trials and false doctrines test the church. Only those anchored in truth and genuine experience will stand."
      },
      {
        id: "shaking-2",
        quoteRecall: false,
        word: "STRAIGHT TESTIMONY",
        clue: "The direct counsel to the Laodiceans that rouses the church and causes the shaking.",
        verse: "Revelation 3:19",
        scripture: "As many as I love, I rebuke and chasten: be zealous therefore, and repent.",
        summary: "The True Witness's testimony is a call to repentance and spiritual revival, dividing those who accept it from those who reject it in self-righteousness."
      },
      {
        id: "shaking-3",
        quoteRecall: false,
        word: "REJECTION OF TRUTH",
        clue: "The choice to compromise or turn away from Bible doctrines, leading to spiritual darkness during sifting.",
        verse: "2 Thessalonians 2:10",
        scripture: "And with all deceivableness of unrighteousness in them that perish; because they received not the love of the truth, that they might be saved.",
        summary: "Compromise with the world and neglected truth leaves the soul vulnerable to the strong delusions of the last days."
      },
      {
        id: "shaking-4",
        quoteRecall: false,
        word: "SIFTING",
        clue: "The purification process where the chaff of worldly members is blown away from the wheat of God's church.",
        verse: "Amos 9:9",
        scripture: "For, lo, I will command, and I will sift the house of Israel among all nations, like as corn is sifted in a sieve, yet shall not the least grain fall upon the earth.",
        summary: "God permits trials to cleanse His church so that she may be presented pure, united, and ready to receive the power of the Latter Rain."
      },
      {
        id: "shaking-5",
        word: "THINGS WHICH CANNOT BE SHAKEN",
        clue: "What remains after God removes what can be shaken.",
        verse: "Hebrews 12:27",
        scripture: "And this word, Yet once more, signifieth the removing of those things that are shaken, as of things that are made, that those things which cannot be shaken may remain.",
        summary: "Only truth rooted in God endures the final shaking of church and world."
      },
    ]
  },
  {
    id: "latter-rain",
    title: "The Latter Rain",
    description: "The magnificent outpouring of the Holy Spirit to prepare the harvest for the end.",
    words: [
      {
        id: "latter-rain-1",
        word: "LATTER RAIN",
        clue: "The final outpouring of the Holy Spirit to ripen the harvest and empower the loud cry.",
        verse: "Joel 2:23",
        scripture: "Be glad then, ye children of Zion, and rejoice in the LORD your God: for he hath given you the former rain moderately, and he will cause to come down for you the rain, the former rain, and the latter rain in the first month.",
        summary: "Just as the early rain started the church at Pentecost, the latter rain will finish God's work on earth with spectacular spiritual power."
      },
      {
        id: "latter-rain-2",
        word: "DAY OF PENTECOST",
        clue: "The historical outpouring of the Holy Spirit that empowered the early Christian church.",
        verse: "Acts 2:1",
        scripture: "And when the day of Pentecost was fully come, they were all with one accord in one place.",
        summary: "Pentecost was the 'early rain' of the Spirit. The latter rain will be even more abundant, covering the whole earth with the glory of God."
      },
      {
        id: "latter-rain-3",
        word: "REFRESHING",
        clue: "Times of spiritual reviving and preparation that come from the presence of the Lord.",
        verse: "Acts 3:19",
        scripture: "Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord;",
        summary: "Before we can receive the fullness of the Holy Spirit, we must experience personal revival, repentance, and the blotting out of sins."
      },
      {
        id: "latter-rain-4",
        word: "HOLY SPIRIT",
        clue: "The Divine Agent of the latter rain outpouring, promised by Christ to guide into all truth.",
        verse: "Ephesians 1:13",
        scripture: "In whom ye also trusted, after that ye heard the word of truth, the gospel of your salvation: in whom also after that ye believed, ye were sealed with that holy Spirit of promise,",
        summary: "We must actively pray for the Holy Spirit daily, preparing our vessels to be filled with the final shower of divine grace."
      },
      {
        id: "latter-rain-5",
        word: "YOUR SONS AND YOUR DAUGHTERS SHALL PROPHESY",
        clue: "Joel’s promise of Spirit on all flesh before the great day.",
        verse: "Joel 2:28",
        scripture: "And it shall come to pass afterward, that I will pour out my spirit upon all flesh; and your sons and your daughters shall prophesy, your old men shall dream dreams, your young men shall see visions:",
        summary: "The latter rain empowers the final gospel witness as Pentecost empowered the first."
      },
    ]
  },
  {
    id: "loud-cry",
    title: "The Loud Cry",
    description: "The final warning warning to the world, swelling into a global shout.",
    words: [
      {
        id: "loud-cry-1",
        quoteRecall: false,
        word: "LOUD CRY",
        clue: "The final worldwide warning message that swells from the third angel's message.",
        verse: "Revelation 18:1",
        scripture: "And after these things I saw another angel come down from heaven, having great power; and the earth was lightened with his glory.",
        summary: "An urgent, powerful call that illuminates the entire earth, exposing deception and presenting God's final invitation of mercy to all mankind."
      },
      {
        id: "loud-cry-2",
        quoteRecall: false,
        word: "THREE ANGELS",
        clue: "The special three-fold message of Revelation 14 containing God's final warning of judgment and worship.",
        verse: "Revelation 14:6-7",
        scripture: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people, Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
        summary: "This message calls humanity back to worshipping the Creator, warns against false worship, and identifies the faithful who keep God's commandments."
      },
      {
        id: "loud-cry-3",
        word: "BABYLON IS FALLEN",
        clue: "The second angel's declaration that the corrupt world religious systems have departed from truth.",
        verse: "Revelation 14:8",
        scripture: "And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
        summary: "Babylon represents confused, compromised religious bodies that have united with the state. God warns that her spiritual fall is complete."
      },
      {
        id: "loud-cry-4",
        word: "OUT OF HER MY PEOPLE",
        clue: "The urgent call of the fourth angel to leave Babylon in order to avoid her plagues.",
        verse: "Revelation 18:4",
        scripture: "And I heard another voice from heaven, saying, Come out of her, my people, that ye be not partakers of her sins, and that ye receive not of her plagues.",
        summary: "God still has sincere followers within compromised religious systems. This is His loving, final appeal for them to walk in full Biblical truth."
      },
      {
        id: "loud-cry-5",
        word: "EARTH WAS LIGHTENED WITH HIS GLORY",
        clue: "Revelation 18 angel fills the world with radiant heavenly light.",
        verse: "Revelation 18:1",
        scripture: "And after these things I saw another angel come down from heaven, having great power; and the earth was lightened with his glory.",
        summary: "The loud cry is not mere volume but global revelation of God’s character and warning."
      },
    ]
  },
  {
    id: "seal-of-god",
    title: "The Seal of God",
    description: "The ultimate sign of allegiance in the final test of worship.",
    words: [
      {
        id: "seal-of-god-1",
        quoteRecall: false,
        word: "SEAL OF GOD",
        clue: "God's sign of authority, ownership, and protection placed upon the foreheads of the faithful.",
        verse: "Revelation 7:3",
        scripture: "Saying, Hurt not the earth, neither the sea, nor the trees, till we have sealed the servants of our God in their foreheads.",
        summary: "The seal of God is a settling into the truth, both intellectually and spiritually, so that believers cannot be moved."
      },
      {
        id: "seal-of-god-2",
        word: "SABBATH",
        clue: "The seventh-day memorial of creation which serves as the core test of allegiance and the sign of the Seal.",
        verse: "Ezekiel 20:12",
        scripture: "Moreover also I gave them my sabbaths, to be a sign between me and them, that they might know that I am the LORD that sanctify them.",
        summary: "As the commandment identifying God as Creator and Sovereign, the Sabbath is the ultimate test of loyalty in the final crisis."
      },
      {
        id: "seal-of-god-3",
        quoteRecall: false,
        word: "SUNDAY LAW",
        clue: "The legislative decree that enforces false worship, establishing the Mark of the Beast in contrast to God's Sabbath.",
        verse: "Revelation 13:16",
        scripture: "And he causeth all, both small and great, rich and poor, free and bond, to receive a mark in their right hand, or in their foreheads:",
        summary: "A legislative decree that forces individuals to choose between obeying human laws or the immutable, holy law of God."
      },
      {
        id: "seal-of-god-4",
        quoteRecall: false,
        word: "MARK OF THE BEAST",
        clue: "The sign of allegiance to the beast power, received when one knowingly rejects God's Sabbath for a human substitute.",
        verse: "Revelation 13:17",
        scripture: "And that no man might buy or sell, save he that had the mark, or the name of the beast, or the number of his name.",
        summary: "Receiving the mark represents submission to earthly powers over God. It stands in direct, active opposition to the Seal of God."
      },
      {
        id: "seal-of-god-5",
        word: "SEAL THE LAW AMONG MY DISCIPLES",
        clue: "Isaiah links sealing God’s law among those who wait for Him.",
        verse: "Isaiah 8:16",
        scripture: "Bind up the testimony, seal the law among my disciples.",
        summary: "God’s seal involves loyalty to His law written in heart and life."
      },
    ]
  },
  {
    id: "time-of-trouble",
    title: "The Time of Trouble",
    description: "The final severe crisis and trial of faith for God's faithful remnant.",
    words: [
      {
        id: "time-of-trouble-1",
        quoteRecall: false,
        word: "CLOSE OF PROBATION",
        clue: "The solemn moment when Christ finishes His intercessory sanctuary ministry and the destiny of all is fixed.",
        verse: "Revelation 22:11",
        scripture: "He that is unjust, let him be unjust still: and he which is filthy, let him be filthy still: and he that is righteous, let him be righteous still: and he that is holy, let him be holy still.",
        summary: "When the intercession of Jesus ends, the door of mercy is closed forever. The righteous remain holy, and the wicked remain wicked."
      },
      {
        id: "time-of-trouble-2",
        word: "TIME OF TROUBLE",
        clue: "A period of unprecedented global crisis and distress that occurs after probation closes.",
        verse: "Daniel 12:1",
        scripture: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation even to that same time: and at that time thy people shall be delivered, every one that shall be found written in the book.",
        summary: "Without an intercessor, the earth experiences the full weight of human rebellion and plagues, but God preserves His faithful ones."
      },
      {
        id: "time-of-trouble-3",
        word: "TIME OF JACOB'S TROUBLE",
        clue: "The intense spiritual wrestling and anguish experienced by the saints as they plead for deliverance.",
        verse: "Jeremiah 30:7",
        scripture: "Alas! for that day is great, so that none is like it: it is even the time of Jacob’s trouble, but he shall be saved out of it.",
        summary: "Believers will review their lives, deeply repenting of any sin, and holding on to God by faith alone, refusing to let Him go."
      },
      {
        id: "time-of-trouble-4",
        quoteRecall: false,
        word: "DEATH DECREE",
        clue: "The final earthly decree dictating that those who refuse to worship the image of the beast should be killed.",
        verse: "Revelation 13:15",
        scripture: "And he had power to give life unto the image of the beast, that the image of the beast should both speak, and cause that as many as would not worship the image of the beast should be killed.",
        summary: "A decree will be passed to execute God's commandment-keeping people. But God will step in to deliver His saints."
      },
      {
        id: "time-of-trouble-5",
        quoteRecall: false,
        word: "MICHAEL SHALL STAND UP",
        clue: "Daniel’s great prince stands for his people in unprecedented trouble.",
        verse: "Daniel 12:1",
        scripture: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation even to that same time: and at that time thy people shall be delivered, every one that shall be found written in the book.",
        summary: "Deliverance is personal and divine when human mediation is finished."
      },
    ]
  },
  {
    id: "second-coming",
    title: "The Second Coming",
    description: "The glorious, triumphant return of Jesus Christ in majesty and power.",
    words: [
      {
        id: "second-coming-1",
        quoteRecall: false,
        word: "SECOND COMING",
        clue: "The glorious, literal, and visible return of Jesus Christ in the clouds of heaven.",
        verse: "Titus 2:13",
        scripture: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ;",
        summary: "The climax of the Christian hope. Jesus returns not in secret, but in supreme majesty, visible to every eye."
      },
      {
        id: "second-coming-2",
        quoteRecall: false,
        word: "EASTERN SKY",
        clue: "The quarter of heaven Christ likens His coming to — lightning shining from the east even unto the west.",
        expertClue: "Great Controversy imagery: a small cloud, about half a man's hand, first appears to the waiting saints.",
        verse: "Matthew 24:30",
        scripture: "And then shall appear the sign of the Son of man in heaven: and then shall all the tribes of the earth mourn, and they shall see the Son of man coming in the clouds of heaven with power and great glory.",
        summary: "A small, dark cloud in the east is the sign of Christ's approach. As it draws near, it becomes a great, brilliant cloud of glory."
      },
      {
        id: "second-coming-3",
        word: "RESURRECTION",
        clue: "The miraculous awakening of the dead in Christ at the sound of the trumpet.",
        verse: "1 Corinthians 15:42",
        scripture: "So also is the resurrection of the dead. It is sown in corruption; it is raised in incorruption:",
        summary: "Graves are opened worldwide, and the sleeping saints are raised with immortal bodies, reunited with their loved ones."
      },
      {
        id: "second-coming-4",
        quoteRecall: false,
        word: "TRANSLATION",
        clue: "The instantaneous change of the living righteous from mortality to immortality, caught up to meet the Lord.",
        verse: "1 Thessalonians 4:17",
        scripture: "Then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air: and so shall we ever be with the Lord.",
        summary: "The living faithful are transformed without seeing death, joining the resurrected saints to meet Jesus in the air."
      },
      {
        id: "second-coming-5",
        word: "EVERY EYE SHALL SEE HIM",
        clue: "John’s description of the public, visible return of Christ.",
        verse: "Revelation 1:7",
        scripture: "Behold, he cometh with clouds; and every eye shall see him, and they also which pierced him: and all kindreds of the earth shall wail because of him. Even so, Amen.",
        summary: "The Advent is not secret; the whole world will know when the King returns."
      },
    ]
  },
  {
    id: "new-earth",
    title: "Heaven and the New Earth",
    description: "The restoration of all things and the eternal reign of peace and joy.",
    words: [
      {
        id: "new-earth-1",
        word: "REMNANT",
        clue: "The end-time group of believers who keep the commandments of God and have the testimony of Jesus.",
        verse: "Revelation 12:17",
        scripture: "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ.",
        summary: "The final fraction of God's church, characterized by loyalty to His law and possession of the prophetic gift."
      },
      {
        id: "new-earth-2",
        word: "NEW EARTH",
        clue: "God's restored, Edenic world recreated from the ashes of sin for the eternal home of the redeemed.",
        verse: "Revelation 21:1",
        scripture: "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.",
        summary: "Sin is permanently erased. The earth is restored to its original beauty, and God dwells personally with His people."
      },
      {
        id: "new-earth-3",
        word: "NEW JERUSALEM",
        clue: "The majestic holy city that descends from God out of heaven to become the capital of the New Earth.",
        verse: "Revelation 21:2",
        scripture: "And I John saw the holy city, new Jerusalem, coming down from God out of heaven, prepared as a bride adorned for her husband.",
        summary: "The capital city of the saved, filled with the glory of God, built of gold and precious stones, where Christ and His saints reside."
      },
      {
        id: "new-earth-4",
        word: "NO MORE DEATH",
        clue: "The glorious state of eternity where pain, sorrow, crying, and physical expiry are completely banished.",
        verse: "Revelation 21:4",
        scripture: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
        summary: "The ultimate triumph of Christ's redemption. Every trace of the curse of sin is wiped away, and eternal joy begins."
      },
      {
        id: "new-earth-5",
        word: "FORMER THINGS ARE PASSED AWAY",
        clue: "God’s promise after tears and death are gone from the new creation.",
        verse: "Revelation 21:4",
        scripture: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
        summary: "Sin’s history ends; the redeemed inherit a world where pain is only a memory."
      },
    ]
  },
  {
    id: "judgment",
    title: "The Investigative Judgment",
    description: "Understand the pre-Advent heavenly court and the cleansing of the sanctuary before Christ returns.",
    words: [
      {
        id: "judgment-1",
        quoteRecall: false,
        word: "INVESTIGATIVE JUDGMENT",
        clue: "The heavenly tribunal where records are examined before Christ's return to earth.",
        expertClue: "Daniel 7:9-10 — books opened; the Ancient of days presides.",
        verse: "Daniel 7:9-10",
        scripture: "I beheld till the thrones were cast down, and the Ancient of days did sit, whose garment was white as snow, and the hair of his head like the pure wool: his throne was like the fiery flame, and his wheels as burning fire. A fiery stream issued and came forth from before him: thousand thousands ministered unto him, and ten thousand times ten thousand stood before him: the judgment was set, and the books were opened.",
        summary: "Before Christ returns as King, heaven conducts a review of every life. This judgment vindicates God's character and confirms who is ready for eternity."
      },
      {
        id: "judgment-2",
        quoteRecall: false,
        word: "PRE ADVENT JUDGMENT",
        clue: "Divine review that must finish before the Second Coming, not after it.",
        expertClue: "2300-day prophecy of Daniel 8:14 points to this cleansing era.",
        verse: "Daniel 8:14",
        scripture: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        summary: "The Bible places judgment before the Advent. God's people are judged while probation still lingers, so the living may be prepared to meet Christ."
      },
      {
        id: "judgment-3",
        quoteRecall: false,
        word: "BLOT OUT SINS",
        clue: "The act of removing confessed transgressions from heavenly records during judgment.",
        expertClue: "Acts 3:19 links repentance with sins being blotted out.",
        verse: "Acts 3:19",
        scripture: "Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord;",
        summary: "Through faith in Christ, forgiven sins are erased from the books of heaven. This is the gospel assurance that motivates holy living."
      },
      {
        id: "judgment-4",
        quoteRecall: false,
        word: "CLEANSING OF SANCTUARY",
        clue: "The antitypical Day of Atonement when the heavenly temple is purified from sin's record.",
        expertClue: "Hebrews 8:1-2 — Christ ministers in the true tabernacle pitched by the Lord.",
        verse: "Hebrews 9:23",
        scripture: "It was therefore necessary that the patterns of things in the heavens should be purified with these; but the heavenly things themselves with better sacrifices than these.",
        summary: "Just as the earthly sanctuary was cleansed on the Day of Atonement, Christ now removes sin's defilement from the heavenly sanctuary through His blood."
      },
      {
        id: "judgment-5",
        word: "BOOKS WERE OPENED",
        clue: "Daniel’s court scene before the Ancient of days.",
        verse: "Daniel 7:10",
        scripture: "A fiery stream issued and came forth from before him: thousand thousands ministered unto him, and ten thousand times ten thousand stood before him: the judgment was set, and the books were opened.",
        summary: "Heaven’s records undergird a fair judgment before the sentence of the ages."
      },
    ]
  },
  {
    id: "deceptions",
    title: "Last-Day Deceptions",
    description: "Recognize Satan's final delusions — spiritualism, strong delusion, and the gathering at Armageddon.",
    words: [
      {
        id: "deceptions-1",
        word: "STRONG DELUSION",
        clue: "God permits believing a lie when truth is rejected — a final test of loyalty.",
        expertClue: "2 Thessalonians 2:11 — sent because they received not the love of the truth.",
        verse: "2 Thessalonians 2:11",
        scripture: "And for this cause God shall send them strong delusion, that they should believe a lie:",
        summary: "When humanity refuses to love truth, God withdraws restraining grace. The result is widespread deception that only Bible students will discern."
      },
      {
        id: "deceptions-2",
        quoteRecall: false,
        word: "SPIRITUALISM",
        clue: "Satan's end-time masquerade through spirits and signs imitating the dead and divine.",
        expertClue: "Revelation 16:13-14 — three unclean spirits like frogs from dragon, beast, false prophet.",
        verse: "Revelation 16:14",
        scripture: "For they are the spirits of devils, working miracles, which go forth unto the kings of the earth and of the whole world, to gather them to the battle of that great day of God Almighty.",
        summary: "Spiritualism will unite the world through miraculous displays. It is one of Satan's most successful tools to replace faith in Scripture with experience and emotion."
      },
      {
        id: "deceptions-3",
        word: "UNCLEAN SPIRITS",
        clue: "Demonic agents released to perform signs and unite the world for the final conflict.",
        expertClue: "Revelation 16:13 — frog-like spirits from the satanic trinity.",
        verse: "Revelation 16:13",
        scripture: "And I saw three unclean spirits like frogs come out of the mouth of the dragon, and out of the mouth of the beast, and out of the mouth of the false prophet.",
        summary: "These spirits perform wonders that deceive rulers and peoples alike, preparing the world to oppose God and His faithful remnant."
      },
      {
        id: "deceptions-4",
        word: "ARMAGEDDON",
        clue: "The symbolic gathering place for the final worldwide showdown between truth and rebellion.",
        expertClue: "Revelation 16:16 — kings gathered to the place called in Hebrew Armageddon.",
        verse: "Revelation 16:16",
        scripture: "And he gathered them together into a place called in the Hebrew tongue Armageddon.",
        summary: "Armageddon is not a literal valley battle alone, but the climactic conflict of the ages where all humanity chooses sides for or against God."
      },
      {
        id: "deceptions-5",
        word: "LYING WONDERS",
        clue: "Paul warns of Satan’s power with deceptive signs after the working of the lawless one.",
        verse: "2 Thessalonians 2:9",
        scripture: "Even him, whose coming is after the working of Satan with all power and signs and lying wonders,",
        summary: "Miracles alone never prove truth; the Word is the test of every wonder."
      },
    ]
  },
  // --- Daniel Track (season) — 5 chapters × 4 terms ---
  {
    id: "daniel-image",
    title: "Daniel: The Great Image",
    description: "Nebuchadnezzar's dream of the multi-metal statue and the stone cut without hands.",
    seasonId: "daniel",
    words: [
      {
        id: "daniel-image-1",
        word: "GREAT IMAGE",
        clue: "The enormous statue of mixed metals that filled the king's dream of successive world empires.",
        verse: "Daniel 2:31",
        scripture: "Thou, O king, sawest, and behold a great image. This great image, whose brightness was excellent, stood before thee; and the form thereof was terrible.",
        summary: "God revealed the outline of history through a single dream-image, showing that earthly kingdoms rise and fall under His sovereignty."
      },
      {
        id: "daniel-image-2",
        word: "HEAD OF GOLD",
        clue: "The top of the image representing Babylon, the first kingdom in the prophetic succession.",
        verse: "Daniel 2:38",
        scripture: "And wheresoever the children of men dwell, the beasts of the field and the fowls of the heaven hath he given into thine hand, and hath made thee ruler over them all. Thou art this head of gold.",
        summary: "Babylon's glory is symbolized by gold — yet even the head of gold is temporary before the everlasting kingdom of God."
      },
      {
        id: "daniel-image-3",
        word: "HIS FEET PART OF IRON AND PART OF CLAY",
        clue: "The lowest members of the dream-image — a brittle mixture the interpretation calls a divided kingdom.",
        verse: "Daniel 2:33",
        scripture: "His legs of iron, his feet part of iron and part of clay.",
        summary: "The final phase of earthly power is strong yet brittle — never fully united until Christ returns."
      },
      {
        id: "daniel-image-4",
        word: "STONE WAS CUT OUT WITHOUT HANDS",
        clue: "The supernatural stone that smashes the image and becomes a mountain filling the whole earth.",
        verse: "Daniel 2:34",
        scripture: "Thou sawest till that a stone was cut out without hands, which smote the image upon his feet that were of iron and clay, and brake them to pieces.",
        summary: "Christ's kingdom is not of human origin. It ends all earthly empires and fills the earth with righteousness forever."
      },
      {
        id: "daniel-image-5",
        word: "GOD OF HEAVEN SET UP A KINGDOM",
        clue: "Daniel interprets the stone kingdom that fills the whole earth.",
        verse: "Daniel 2:44",
        scripture: "And in the days of these kings shall the God of heaven set up a kingdom, which shall never be destroyed: and the kingdom shall not be left to other people, but it shall break in pieces and consume all these kingdoms, and it shall stand for ever.",
        summary: "Human empires fall; Christ’s kingdom alone is everlasting."
      },
    ]
  },
  {
    id: "daniel-beasts",
    title: "Daniel: Four Beasts",
    description: "The night vision of four great beasts rising from the sea — successive world powers.",
    seasonId: "daniel",
    words: [
      {
        id: "daniel-beasts-1",
        word: "FOUR GREAT BEASTS",
        clue: "Four diverse animals that came up from the sea, representing four kings or kingdoms.",
        verse: "Daniel 7:3",
        scripture: "And four great beasts came up from the sea, diverse one from another.",
        summary: "From the turbulent sea of nations rise successive empires — a second line of prophecy paralleling the metallic image."
      },
      {
        id: "daniel-beasts-2",
        word: "THE FIRST WAS LIKE A LION",
        clue: "The first beast of Daniel 7, swift and royal, matching Babylon's golden head.",
        verse: "Daniel 7:4",
        scripture: "The first was like a lion, and had eagle’s wings: I beheld till the wings thereof were plucked, and it was lifted up from the earth, and made stand upon the feet as a man, and a man’s heart was given to it.",
        summary: "Wings of speed give way to a humbled, humanized form — Babylon's pride is checked by the God of heaven."
      },
      {
        id: "daniel-beasts-3",
        word: "RAISED UP ITSELF ON ONE SIDE",
        clue: "Daniel's second beast — lopsided power devouring much flesh.",
        verse: "Daniel 7:5",
        scripture: "And behold another beast, a second, like to a bear, and it raised up itself on one side, and it had three ribs in the mouth of it between the teeth of it: and they said thus unto it, Arise, devour much flesh.",
        summary: "Medo-Persia's lopsided strength and conquests fulfill the second stage of the four-beast vision."
      },
      {
        id: "daniel-beasts-4",
        word: "FOUR WINGS OF A FOWL",
        clue: "Third kingdom beast in Daniel 7 — swift empire with multiple heads.",
        verse: "Daniel 7:6",
        scripture: "After this I beheld, and lo another, like a leopard, which had upon the back of it four wings of a fowl; the beast had also four heads; and dominion was given to it.",
        summary: "Swift as a leopard, Greece under Alexander spreads quickly, then divides into four successor domains."
      },
      {
        id: "daniel-beasts-5",
        word: "FOUR KINGS WHICH SHALL ARISE",
        clue: "Angel’s plain interpretation of the four great beasts from the sea.",
        verse: "Daniel 7:17",
        scripture: "These great beasts, which are four, are four kings, which shall arise out of the earth.",
        summary: "Prophecy decodes empire after empire until the saints receive the kingdom."
      },
    ]
  },
  {
    id: "daniel-horn",
    title: "Daniel: The Little Horn",
    description: "The blasphemous power that rises among the ten horns and speaks great words against the Most High.",
    seasonId: "daniel",
    words: [
      {
        id: "daniel-horn-1",
        word: "LITTLE HORN",
        clue: "A horn that arises among ten, uprooting three, with eyes like a man and a mouth speaking great things.",
        verse: "Daniel 7:8",
        scripture: "I considered the horns, and, behold, there came up among them another little horn, before whom there were three of the first horns plucked up by the roots: and, behold, in this horn were eyes like the eyes of man, and a mouth speaking great things.",
        summary: "A religio-political power emerges after imperial Rome, marked by intelligence, speech, and the displacement of rivals."
      },
      {
        id: "daniel-horn-2",
        word: "SPEAK GREAT WORDS",
        clue: "The little horn's blasphemous claims against the Most High.",
        verse: "Daniel 7:25",
        scripture: "And he shall speak great words against the most High, and shall wear out the saints of the most High, and think to change times and laws: and they shall be given into his hand until a time and times and the dividing of time.",
        summary: "Blasphemy, persecution of the saints, and attempts to alter divine times and laws identify this power in history and prophecy."
      },
      {
        id: "daniel-horn-3",
        word: "TIME AND TIMES AND THE DIVIDING OF TIME",
        clue: "The prophetic period during which the saints are given into the little horn's hand.",
        verse: "Daniel 7:25",
        scripture: "And he shall speak great words against the most High, and shall wear out the saints of the most High, and think to change times and laws: and they shall be given into his hand until a time and times and the dividing of time.",
        summary: "A fixed prophetic timespan limits oppression; God sets the bounds of the little horn's dominion."
      },
      {
        id: "daniel-horn-4",
        word: "JUDGMENT WAS SET",
        clue: "The heavenly court session when the books were opened before the Ancient of days.",
        verse: "Daniel 7:10",
        scripture: "A fiery stream issued and came forth from before him: thousand thousands ministered unto him, and ten thousand times ten thousand stood before him: the judgment was set, and the books were opened.",
        summary: "Heaven's judgment answers blasphemy with final justice; the horn's dominion ends under the verdict of God."
      },
      {
        id: "daniel-horn-5",
        word: "WEAR OUT THE SAINTS",
        clue: "The little horn makes war on the holy ones for a prophetic time.",
        verse: "Daniel 7:25",
        scripture: "And he shall speak great words against the most High, and shall wear out the saints of the most High, and think to change times and laws: and they shall be given into his hand until a time and times and the dividing of time.",
        summary: "Persecuting power is limited by heaven’s calendar; saints outlast the horn."
      },
    ]
  },
  {
    id: "daniel-sanctuary",
    title: "Daniel: Sanctuary Cleansed",
    description: "The 2300-day prophecy and the cleansing of the sanctuary in heaven.",
    seasonId: "daniel",
    words: [
      {
        id: "daniel-sanctuary-1",
        word: "TWO THOUSAND AND THREE HUNDRED DAYS",
        clue: "The long prophetic period after which the sanctuary shall be cleansed.",
        verse: "Daniel 8:14",
        scripture: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        summary: "This prophetic span anchors Advent hope in a heavenly Day of Atonement work before the Second Coming."
      },
      {
        id: "daniel-sanctuary-2",
        word: "SANCTUARY BE CLEANSED",
        clue: "The climactic phrase of Daniel 8:14 announcing purification of the heavenly sanctuary.",
        verse: "Daniel 8:14",
        scripture: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        summary: "Cleansing points to Christ's priestly ministry removing the record of confessed sin in the true tabernacle."
      },
      {
        id: "daniel-sanctuary-3",
        word: "DAILY SACRIFICE",
        clue: "The continual ministry cast down by the little horn in Daniel 8's vision of the ram and goat.",
        verse: "Daniel 8:11",
        scripture: "Yea, he magnified himself even to the prince of the host, and by him the daily sacrifice was taken away, and the place of his sanctuary was cast down.",
        summary: "Counterfeit systems obscure Christ's continual priesthood; the sanctuary truth restores the true ministry."
      },
      {
        id: "daniel-sanctuary-4",
        word: "EVENING AND THE MORNING",
        clue: "The prophetic day unit named when the angel affirms the vision is true and to be shut up.",
        verse: "Daniel 8:26",
        scripture: "And the vision of the evening and the morning which was told is true: wherefore shut thou up the vision; for it shall be for many days.",
        summary: "Evening-morning language marks prophetic days; the vision reaches far beyond Daniel's own lifetime."
      },
      {
        id: "daniel-sanctuary-5",
        word: "HOW LONG SHALL BE THE VISION",
        clue: "The holy one’s question that introduces the 2300 days.",
        verse: "Daniel 8:13",
        scripture: "Then I heard one saint speaking, and another saint said unto that certain saint which spake, How long shall be the vision concerning the daily sacrifice, and the transgression of desolation, to give both the sanctuary and the host to be trodden under foot?",
        summary: "Longest prophetic timeline anchors hope in the cleansing of the sanctuary."
      },
    ]
  },
  {
    id: "daniel-stand",
    title: "Daniel: Michael Stands Up",
    description: "The close of the book of Daniel — Michael, the sealed book, and the wise who shine.",
    seasonId: "daniel",
    words: [
      {
        id: "daniel-stand-1",
        word: "MICHAEL STAND UP",
        clue: "The great prince who stands for God's people at the time of unprecedented trouble.",
        verse: "Daniel 12:1",
        scripture: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation even to that same time: and at that time thy people shall be delivered, every one that shall be found written in the book.",
        summary: "When Michael stands, deliverance comes for those written in the book — after the final crisis of earth's history."
      },
      {
        id: "daniel-stand-2",
        word: "WRITTEN IN THE BOOK",
        clue: "The record that identifies who will be delivered when Michael stands up.",
        verse: "Daniel 12:1",
        scripture: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation even to that same time: and at that time thy people shall be delivered, every one that shall be found written in the book.",
        summary: "Salvation is personal and recorded. Only those found written in the book share Michael's deliverance."
      },
      {
        id: "daniel-stand-3",
        word: "MANY SHALL RUN TO AND FRO",
        clue: "The end-time increase of knowledge and earnest searching of prophecy.",
        verse: "Daniel 12:4",
        scripture: "But thou, O Daniel, shut up the words, and seal the book, even to the time of the end: many shall run to and fro, and knowledge shall be increased.",
        summary: "As the end nears, sealed prophecy opens and diligent study multiplies understanding among the faithful."
      },
      {
        id: "daniel-stand-4",
        word: "WISE SHALL SHINE",
        clue: "Those who turn many to righteousness, shining as the brightness of the firmament.",
        verse: "Daniel 12:3",
        scripture: "And they that be wise shall shine as the brightness of the firmament; and they that turn many to righteousness as the stars for ever and ever.",
        summary: "Wisdom in prophecy leads to soul-winning; the reward is everlasting brightness with the redeemed."
      },
      {
        id: "daniel-stand-5",
        word: "KNOWLEDGE SHALL BE INCREASED",
        clue: "End-time running to and fro with increase of knowledge.",
        verse: "Daniel 12:4",
        scripture: "But thou, O Daniel, shut up the words, and seal the book, even to the time of the end: many shall run to and fro, and knowledge shall be increased.",
        summary: "Sealed prophecy opens as the time of the end arrives."
      },
    ]
  },
  // --- Revelation Track (season) — 5 chapters × 4 terms ---
  {
    id: "rev-churches",
    title: "Revelation: Seven Churches",
    description: "Christ's letters to the seven churches of Asia — counsel for every age of the church.",
    seasonId: "revelation",
    words: [
      {
        id: "rev-churches-1",
        word: "SEVEN CHURCHES",
        clue: "The congregations in Asia to whom John is commanded to write the Revelation.",
        verse: "Revelation 1:11",
        scripture: "Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
        summary: "Seven local churches receive living messages that also map the spiritual eras of Christian history."
      },
      {
        id: "rev-churches-2",
        word: "FIRST LOVE",
        clue: "What Ephesus left behind, and what Christ calls them to remember and do again.",
        verse: "Revelation 2:4",
        scripture: "Nevertheless I have somewhat against thee, because thou hast left thy first love.",
        summary: "Orthodoxy without love is incomplete. Christ invites the church to return to the affection of its beginning."
      },
      {
        id: "rev-churches-3",
        word: "LAODICEA",
        clue: "The lukewarm church that says it is rich yet needs gold, raiment, and eyesalve from Christ.",
        verse: "Revelation 3:14",
        scripture: "And unto the angel of the church of the Laodiceans write; These things saith the Amen, the faithful and true witness, the beginning of the creation of God;",
        summary: "End-time self-satisfaction is the danger; Christ's rebuke is love calling His people to repentance and zeal."
      },
      {
        id: "rev-churches-4",
        word: "OPEN DOOR",
        clue: "The door Christ sets before Philadelphia that no man can shut.",
        verse: "Revelation 3:8",
        scripture: "I know thy works: behold, I have set before thee an open door, and no man can shut it: for thou hast a little strength, and hast kept my word, and hast not denied my name.",
        summary: "Mission opportunity and heavenly access open to a faithful remnant who keep His word despite little strength."
      },
      {
        id: "rev-churches-5",
        word: "BE ZEALOUS THEREFORE AND REPENT",
        clue: "Christ’s counsel to lukewarm Laodicea.",
        verse: "Revelation 3:19",
        scripture: "As many as I love, I rebuke and chasten: be zealous therefore, and repent.",
        summary: "Love rebukes; repentance restores the end-time church to usefulness."
      },
    ]
  },
  {
    id: "rev-seals",
    title: "Revelation: Seven Seals",
    description: "The Lamb opens the sealed book — conquest, conflict, scarcity, and the cry of the martyrs.",
    seasonId: "revelation",
    words: [
      {
        id: "rev-seals-1",
        word: "SEALED WITH SEVEN SEALS",
        clue: "The scroll in God's right hand that only the Lamb is worthy to open.",
        verse: "Revelation 5:1",
        scripture: "And I saw in the right hand of him that sat on the throne a book written within and on the backside, sealed with seven seals.",
        summary: "Human history's sealed decrees open only through Christ's worthiness as the slain yet risen Lamb."
      },
      {
        id: "rev-seals-2",
        word: "WHITE HORSE",
        clue: "The first seal's rider going forth conquering and to conquer.",
        verse: "Revelation 6:2",
        scripture: "And I saw, and behold a white horse: and he that sat on him had a bow; and a crown was given unto him: and he went forth conquering, and to conquer.",
        summary: "The pure advance of the gospel is pictured as a conquering rider under the first seal."
      },
      {
        id: "rev-seals-3",
        word: "UNDER THE ALTAR",
        clue: "The fifth-seal cry of the martyrs asking how long until their blood is avenged.",
        verse: "Revelation 6:9",
        scripture: "And when he had opened the fifth seal, I saw under the altar the souls of them that were slain for the word of God, and for the testimony which they held:",
        summary: "Persecuted saints are not forgotten; their appeal rises until the final vindication of God."
      },
      {
        id: "rev-seals-4",
        word: "SIXTH SEAL",
        clue: "The seal of cosmic signs — earthquake, darkened sun, falling stars — before the great day.",
        verse: "Revelation 6:12",
        scripture: "And I beheld when he had opened the sixth seal, and, lo, there was a great earthquake; and the sun became black as sackcloth of hair, and the moon became as blood;",
        summary: "Nature itself signals the nearness of judgment, calling the world to prepare for the Lamb's day."
      },
      {
        id: "rev-seals-5",
        word: "HOW LONG O LORD HOLY AND TRUE",
        clue: "Cry of the fifth-seal martyrs under the altar.",
        verse: "Revelation 6:10",
        scripture: "And they cried with a loud voice, saying, How long, O Lord, holy and true, dost thou not judge and avenge our blood on them that dwell on the earth?",
        summary: "Justice delayed is not justice denied; God answers in His time."
      },
    ]
  },
  {
    id: "rev-trumpets",
    title: "Revelation: Seven Trumpets",
    description: "Trumpet judgments that warn the earth as history moves toward the final crisis.",
    seasonId: "revelation",
    words: [
      {
        id: "rev-trumpets-1",
        word: "SEVEN TRUMPETS",
        clue: "The series of angel-blown warnings that follow the opening of the seventh seal's silence.",
        verse: "Revelation 8:6",
        scripture: "And the seven angels which had the seven trumpets prepared themselves to sound.",
        summary: "Trumpets in Scripture summon, warn, and announce war — here they mark successive judgments on a rebellious world."
      },
      {
        id: "rev-trumpets-2",
        word: "PRAYERS OF THE SAINTS",
        clue: "What the angel offers with incense upon the golden altar before the throne.",
        verse: "Revelation 8:3",
        scripture: "And another angel came and stood at the altar, having a golden censer; and there was given unto him much incense, that he should offer it with the prayers of all saints upon the golden altar which was before the throne. And the smoke of the incense, which came with the prayers of the saints, ascended up before God out of the angel’s hand.",
        summary: "Before trumpets sound, intercession and prayer rise with incense — mercy still mingles with judgment."
      },
      {
        id: "rev-trumpets-3",
        word: "WOE WOE WOE",
        clue: "The triple cry of the eagle announcing the last three trumpets upon earth's inhabitants.",
        verse: "Revelation 8:13",
        scripture: "And I beheld, and heard an angel flying through the midst of heaven, saying with a loud voice, Woe, woe, woe, to the inhabiters of the earth by reason of the other voices of the trumpet of the three angels, which are yet to sound!",
        summary: "The final three trumpets intensify crisis; heaven itself warns that greater trouble still approaches."
      },
      {
        id: "rev-trumpets-4",
        word: "MYSTERY OF GOD SHOULD BE FINISHED",
        clue: "What is completed in the days of the voice of the seventh angel when he begins to sound.",
        verse: "Revelation 10:7",
        scripture: "But in the days of the voice of the seventh angel, when he shall begin to sound, the mystery of God should be finished, as he hath declared to his servants the prophets.",
        summary: "The seventh trumpet era closes the prophetic mystery and ushers in the finishing of God's plan of salvation."
      },
      {
        id: "rev-trumpets-5",
        word: "SEVEN ANGELS WHICH HAD THE SEVEN TRUMPETS",
        clue: "Angels prepared to sound the judgments of the trumpets.",
        verse: "Revelation 8:6",
        scripture: "And the seven angels which had the seven trumpets prepared themselves to sound.",
        summary: "Trumpets warn the world while mercy still mingles with judgment."
      },
    ]
  },
  {
    id: "rev-beast",
    title: "Revelation: The Beast System",
    description: "Sea beast, earth beast, and the image that enforces false worship in the final crisis.",
    seasonId: "revelation",
    words: [
      {
        id: "rev-beast-1",
        word: "BEAST RISE UP OUT OF THE SEA",
        clue: "The composite leopard-bear-lion power that rises from the sea with seven heads and ten horns.",
        verse: "Revelation 13:1",
        scripture: "And I stood upon the sand of the sea, and saw a beast rise up out of the sea, having seven heads and ten horns, and upon his horns ten crowns, and upon his heads the name of blasphemy.",
        summary: "A blasphemous world power unites features of prior empires and receives authority for a limited prophetic period."
      },
      {
        id: "rev-beast-2",
        word: "ANOTHER BEAST COMING UP OUT OF THE EARTH",
        clue: "The second beast with two lamb-like horns that speaks as a dragon.",
        verse: "Revelation 13:11",
        scripture: "And I beheld another beast coming up out of the earth; and he had two horns like a lamb, and he spake as a dragon.",
        summary: "Gentle appearance with dragon speech points to a power that begins with liberty yet ends enforcing tyranny."
      },
      {
        id: "rev-beast-3",
        word: "IMAGE OF THE BEAST",
        clue: "The structure the earth beast causes to be made, which both speaks and kills dissenters.",
        verse: "Revelation 13:15",
        scripture: "And he had power to give life unto the image of the beast, that the image of the beast should both speak, and cause that as many as would not worship the image of the beast should be killed.",
        summary: "An image copies the first beast's principle of enforced religion — the final test of worship for every soul."
      },
      {
        id: "rev-beast-4",
        word: "NUMBER OF HIS NAME",
        clue: "The number of a man associated with the beast — six hundred threescore and six.",
        verse: "Revelation 13:17",
        scripture: "And that no man might buy or sell, save he that had the mark, or the name of the beast, or the number of his name.",
        summary: "Wisdom and understanding are required to identify the beast; Scripture invites careful, prayerful study — not superstition."
      },
      {
        id: "rev-beast-5",
        word: "KEEP THE COMMANDMENTS OF GOD",
        clue: "Remnant mark with the faith of Jesus in Revelation 14.",
        verse: "Revelation 14:12",
        scripture: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        summary: "Commandments of God and faith of Jesus define those who endure."
      },
    ]
  },
  {
    id: "rev-millennium",
    title: "Revelation: The Millennium",
    description: "The thousand years, the binding of Satan, and the final judgment after the first resurrection.",
    seasonId: "revelation",
    words: [
      {
        id: "rev-millennium-1",
        word: "THOUSAND YEARS",
        clue: "The millennial period during which Satan is bound and the saints reign with Christ.",
        verse: "Revelation 20:2",
        scripture: "And he laid hold on the dragon, that old serpent, which is the Devil, and Satan, and bound him a thousand years,",
        summary: "A fixed thousand-year epoch separates the first resurrection of the just from the final destruction of evil."
      },
      {
        id: "rev-millennium-2",
        word: "FIRST RESURRECTION",
        clue: "The blessed rising of those who share in life with Christ at the start of the thousand years.",
        verse: "Revelation 20:6",
        scripture: "Blessed and holy is he that hath part in the first resurrection: on such the second death hath no power, but they shall be priests of God and of Christ, and shall reign with him a thousand years.",
        summary: "Participation in the first resurrection means eternal safety from the second death and shared reign with Christ."
      },
      {
        id: "rev-millennium-3",
        word: "SECOND DEATH",
        clue: "The final destruction that has no power over those in the first resurrection.",
        verse: "Revelation 20:14",
        scripture: "And death and hell were cast into the lake of fire. This is the second death.",
        summary: "Death itself is destroyed; the second death ends sin permanently for those who refuse the first resurrection's hope."
      },
      {
        id: "rev-millennium-4",
        word: "BOOK OF LIFE",
        clue: "The register opened at the great white throne; those not found written are judged accordingly.",
        verse: "Revelation 20:15",
        scripture: "And whosoever was not found written in the book of life was cast into the lake of fire.",
        summary: "Eternal destiny turns on the book of life — a call to trust Christ now while mercy still invites."
      },
      {
        id: "rev-millennium-5",
        word: "THEY LIVED AND REIGNED WITH CHRIST",
        clue: "Those in the first resurrection share His rule for a thousand years.",
        verse: "Revelation 20:4",
        scripture: "And I saw thrones, and they sat upon them, and judgment was given unto them: and I saw the souls of them that were beheaded for the witness of Jesus, and for the word of God, and which had not worshipped the beast, neither his image, neither had received his mark upon their foreheads, or in their hands; and they lived and reigned with Christ a thousand years.",
        summary: "The millennium is victory for the redeemed and judgment review with Christ."
      },
    ]
  },
  ...expansionChapters,
  ...expansionChapters2,
];

const enrichedChapters: Chapter[] = rawChaptersData.map((chapter) => ({
  ...chapter,
  words: chapter.words.map(applyExpertClue),
}));

export const chaptersData: Chapter[] = enrichedChapters;

export const allWordsList: WordTerm[] = chaptersData.reduce<WordTerm[]>((acc, chapter) => {
  return [...acc, ...chapter.words];
}, []);
