import { applyExpertClue } from "./expertClues";

export interface WordTerm {
  id: string;
  word: string;
  clue: string;
  expertClue?: string;
  verse: string;
  scripture: string;
  summary: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  words: WordTerm[];
}

const rawChaptersData: Chapter[] = [
  {
    id: "signs",
    title: "Signs of Christ's Return",
    description: "Discover the warnings and symptoms of a world preparing for the Second Advent.",
    words: [
      {
        id: "signs-1",
        word: "WARS AND RUMORS OF WARS",
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
        verse: "Matthew 24:9",
        scripture: "Then shall they deliver you up to be afflicted, and shall kill you: and ye shall be hated of all nations for my name's sake.",
        summary: "Opposition from the world reveals the true character of our faith and purifies the church, preparing believers to stand in the final conflict."
      },
      {
        id: "signs-4",
        word: "PREACHING THE GOSPEL",
        clue: "The ultimate gospel task that must be finished in all the world as a witness before the end.",
        verse: "Matthew 24:14",
        scripture: "And this gospel of the kingdom shall be preached in all the world for a witness unto all nations; and then shall the end come.",
        summary: "The end will not come until everyone has had a fair opportunity to hear and accept the message of salvation. We are called to cooperate in this great work."
      }
    ]
  },
  {
    id: "shaking",
    title: "The Shaking",
    description: "Examine the great sifting process within the church as truth and error collide.",
    words: [
      {
        id: "shaking-1",
        word: "SHAKING",
        clue: "A testing time among God's people where the superficial are separated from the faithful.",
        verse: "Hebrews 12:27",
        scripture: "And this word, Yet once more, signifieth the removing of those things that are shaken, as of things that are made, that those things which cannot be shaken may remain.",
        summary: "A great sifting occurs as trials and false doctrines test the church. Only those anchored in truth and genuine experience will stand."
      },
      {
        id: "shaking-2",
        word: "STRAIGHT TESTIMONY",
        clue: "The direct counsel to the Laodiceans that rouses the church and causes the shaking.",
        verse: "Revelation 3:19",
        scripture: "As many as I love, I rebuke and chasten: be zealous therefore, and repent.",
        summary: "The True Witness's testimony is a call to repentance and spiritual revival, dividing those who accept it from those who reject it in self-righteousness."
      },
      {
        id: "shaking-3",
        word: "REJECTION OF TRUTH",
        clue: "The choice to compromise or turn away from Bible doctrines, leading to spiritual darkness during sifting.",
        verse: "2 Thessalonians 2:10",
        scripture: "And with all deceivableness of unrighteousness in them that perish; because they received not the love of the truth, that they might be saved.",
        summary: "Compromise with the world and neglected truth leaves the soul vulnerable to the strong delusions of the last days."
      },
      {
        id: "shaking-4",
        word: "SIFTING",
        clue: "The purification process where the chaff of worldly members is blown away from the wheat of God's church.",
        verse: "Amos 9:9",
        scripture: "For, lo, I will command, and I will sift the house of Israel among all nations, like as corn is sifted in a sieve, yet shall not the least grain fall upon the earth.",
        summary: "God permits trials to cleanse His church so that she may be presented pure, united, and ready to receive the power of the Latter Rain."
      }
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
        word: "PENTECOST",
        clue: "The historical outpouring of the Holy Spirit that empowered the early Christian church.",
        verse: "Acts 2:4",
        scripture: "And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them utterance.",
        summary: "Pentecost was the 'early rain' of the Spirit. The latter rain will be even more abundant, covering the whole earth with the glory of God."
      },
      {
        id: "latter-rain-3",
        word: "REFRESHING",
        clue: "Times of spiritual reviving and preparation that come from the presence of the Lord.",
        verse: "Acts 3:19",
        scripture: "Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord.",
        summary: "Before we can receive the fullness of the Holy Spirit, we must experience personal revival, repentance, and the blotting out of sins."
      },
      {
        id: "latter-rain-4",
        word: "HOLY SPIRIT",
        clue: "The Divine Agent of the latter rain outpouring, promised by Christ to guide into all truth.",
        verse: "Zechariah 10:1",
        scripture: "Ask ye of the LORD rain in the time of the latter rain; so the LORD shall make bright clouds, and give them showers of rain, to every one grass in the field.",
        summary: "We must actively pray for the Holy Spirit daily, preparing our vessels to be filled with the final shower of divine grace."
      }
    ]
  },
  {
    id: "loud-cry",
    title: "The Loud Cry",
    description: "The final warning warning to the world, swelling into a global shout.",
    words: [
      {
        id: "loud-cry-1",
        word: "LOUD CRY",
        clue: "The final worldwide warning message that swells from the third angel's message.",
        verse: "Revelation 18:1",
        scripture: "And after these things I saw another angel come down from heaven, having great power; and the earth was lightened with his glory.",
        summary: "An urgent, powerful call that illuminates the entire earth, exposing deception and presenting God's final invitation of mercy to all mankind."
      },
      {
        id: "loud-cry-2",
        word: "THREE ANGELS",
        clue: "The special three-fold message of Revelation 14 containing God's final warning of judgment and worship.",
        verse: "Revelation 14:6-7",
        scripture: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth... Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come...",
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
      }
    ]
  },
  {
    id: "seal-of-god",
    title: "The Seal of God",
    description: "The ultimate sign of allegiance in the final test of worship.",
    words: [
      {
        id: "seal-of-god-1",
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
        word: "SUNDAY LAW",
        clue: "The legislative decree that enforces false worship, establishing the Mark of the Beast in contrast to God's Sabbath.",
        verse: "Revelation 13:16",
        scripture: "And he causeth all, both small and great, rich and poor, free and bond, to receive a mark in their right hand, or in their foreheads.",
        summary: "A legislative decree that forces individuals to choose between obeying human laws or the immutable, holy law of God."
      },
      {
        id: "seal-of-god-4",
        word: "MARK OF THE BEAST",
        clue: "The sign of allegiance to the beast power, received when one knowingly rejects God's Sabbath for a human substitute.",
        verse: "Revelation 13:17",
        scripture: "And that no man might buy or sell, save he that had the mark, or the name of the beast, or the number of his name.",
        summary: "Receiving the mark represents submission to earthly powers over God. It stands in direct, active opposition to the Seal of God."
      }
    ]
  },
  {
    id: "time-of-trouble",
    title: "The Time of Trouble",
    description: "The final severe crisis and trial of faith for God's faithful remnant.",
    words: [
      {
        id: "time-of-trouble-1",
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
        scripture: "And at that time shall Michael stand up, the great prince which standeth for the children of thy people: and there shall be a time of trouble, such as never was since there was a nation...",
        summary: "Without an intercessor, the earth experiences the full weight of human rebellion and plagues, but God preserves His faithful ones."
      },
      {
        id: "time-of-trouble-3",
        word: "JACOBS TROUBLE",
        clue: "The intense spiritual wrestling and anguish experienced by the saints as they plead for deliverance.",
        verse: "Jeremiah 30:7",
        scripture: "Alas! for that day is great, so that none is like it: it is even the time of Jacob's trouble, but he shall be saved out of it.",
        summary: "Believers will review their lives, deeply repenting of any sin, and holding on to God by faith alone, refusing to let Him go."
      },
      {
        id: "time-of-trouble-4",
        word: "DEATH DECREE",
        clue: "The final earthly decree dictating that those who refuse to worship the image of the beast should be killed.",
        verse: "Revelation 13:15",
        scripture: "And he had power to give life unto the image of the beast, that the image of the beast should both speak, and cause that as many as would not worship the image of the beast should be killed.",
        summary: "A decree will be passed to execute God's commandment-keeping people. But God will step in to deliver His saints."
      }
    ]
  },
  {
    id: "second-coming",
    title: "The Second Coming",
    description: "The glorious, triumphant return of Jesus Christ in majesty and power.",
    words: [
      {
        id: "second-coming-1",
        word: "SECOND COMING",
        clue: "The glorious, literal, and visible return of Jesus Christ in the clouds of heaven.",
        verse: "Titus 2:13",
        scripture: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
        summary: "The climax of the Christian hope. Jesus returns not in secret, but in supreme majesty, visible to every eye."
      },
      {
        id: "second-coming-2",
        word: "EASTERN SKY",
        clue: "The direction where a small cloud, about half the size of a man's hand, first appears to the waiting saints.",
        verse: "Matthew 24:30",
        scripture: "And then shall appear the sign of the Son of man in heaven: and then shall all the tribes of the earth mourn, and they shall see the Son of man coming in the clouds of heaven with power and great glory.",
        summary: "A small, dark cloud in the east is the sign of Christ's approach. As it draws near, it becomes a great, brilliant cloud of glory."
      },
      {
        id: "second-coming-3",
        word: "RESURRECTION",
        clue: "The miraculous awakening of the dead in Christ at the sound of the trumpet.",
        verse: "1 Thessalonians 4:16",
        scripture: "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first.",
        summary: "Graves are opened worldwide, and the sleeping saints are raised with immortal bodies, reunited with their loved ones."
      },
      {
        id: "second-coming-4",
        word: "TRANSLATION",
        clue: "The instantaneous change of the living righteous from mortality to immortality, caught up to meet the Lord.",
        verse: "1 Thessalonians 4:17",
        scripture: "Then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air: and so shall we ever be with the Lord.",
        summary: "The living faithful are transformed without seeing death, joining the resurrected saints to meet Jesus in the air."
      }
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
      }
    ]
  },
  {
    id: "judgment",
    title: "The Investigative Judgment",
    description: "Understand the pre-Advent heavenly court and the cleansing of the sanctuary before Christ returns.",
    words: [
      {
        id: "judgment-1",
        word: "INVESTIGATIVE JUDGMENT",
        clue: "The heavenly tribunal where records are examined before Christ's return to earth.",
        expertClue: "Daniel 7:9-10 — books opened; the Ancient of days presides.",
        verse: "Daniel 7:9-10",
        scripture: "I beheld till the thrones were cast down, and the Ancient of days did sit... thousand thousands ministered unto him, and ten thousand times ten thousand stood before him: the judgment was set, and the books were opened.",
        summary: "Before Christ returns as King, heaven conducts a review of every life. This judgment vindicates God's character and confirms who is ready for eternity."
      },
      {
        id: "judgment-2",
        word: "PRE ADVENT JUDGMENT",
        clue: "Divine review that must finish before the Second Coming, not after it.",
        expertClue: "2300-day prophecy of Daniel 8:14 points to this cleansing era.",
        verse: "Daniel 8:14",
        scripture: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        summary: "The Bible places judgment before the Advent. God's people are judged while probation still lingers, so the living may be prepared to meet Christ."
      },
      {
        id: "judgment-3",
        word: "BLOT OUT SINS",
        clue: "The act of removing confessed transgressions from heavenly records during judgment.",
        expertClue: "Acts 3:19 links repentance with sins being blotted out.",
        verse: "Acts 3:19",
        scripture: "Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord.",
        summary: "Through faith in Christ, forgiven sins are erased from the books of heaven. This is the gospel assurance that motivates holy living."
      },
      {
        id: "judgment-4",
        word: "CLEANSING OF SANCTUARY",
        clue: "The antitypical Day of Atonement when the heavenly temple is purified from sin's record.",
        expertClue: "Hebrews 8:1-2 — Christ ministers in the true tabernacle pitched by the Lord.",
        verse: "Hebrews 9:23",
        scripture: "It was therefore necessary that the patterns of things in the heavens should be purified with these; but the heavenly things themselves with better sacrifices than these.",
        summary: "Just as the earthly sanctuary was cleansed on the Day of Atonement, Christ now removes sin's defilement from the heavenly sanctuary through His blood."
      }
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
        scripture: "And for this cause God shall send them strong delusion, that they should believe a lie.",
        summary: "When humanity refuses to love truth, God withdraws restraining grace. The result is widespread deception that only Bible students will discern."
      },
      {
        id: "deceptions-2",
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
      }
    ]
  }
];

const enrichedChapters: Chapter[] = rawChaptersData.map((chapter) => ({
  ...chapter,
  words: chapter.words.map(applyExpertClue),
}));

export const chaptersData: Chapter[] = enrichedChapters;

export const allWordsList: WordTerm[] = chaptersData.reduce<WordTerm[]>((acc, chapter) => {
  return [...acc, ...chapter.words];
}, []);
