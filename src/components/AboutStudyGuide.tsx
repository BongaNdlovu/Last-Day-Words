import React, { useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Star, Search, Sparkles } from "lucide-react";
import { chaptersData, WordTerm, allWordsList } from "../data/words";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface AboutStudyGuideProps {
  onBack: () => void;
}

export default function AboutStudyGuide({ onBack }: AboutStudyGuideProps) {
  const rm = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>("signs");
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId);
  };

  const toggleWord = (wordId: string) => {
    setExpandedWordId(expandedWordId === wordId ? null : wordId);
  };

  // Filter word items based on search query
  const getFilteredTerms = () => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { chapterTitle: string; word: WordTerm }[] = [];

    chaptersData.forEach((chapter) => {
      chapter.words.forEach((word) => {
        if (
          word.word.toLowerCase().includes(query) ||
          word.clue.toLowerCase().includes(query) ||
          (word.expertClue?.toLowerCase().includes(query) ?? false) ||
          word.verse.toLowerCase().includes(query) ||
          word.summary.toLowerCase().includes(query)
        ) {
          results.push({ chapterTitle: chapter.title, word });
        }
      });
    });

    return results;
  };

  const searchResults = getFilteredTerms();

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 px-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e2d2ac]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#5c4a33] hover:text-[#2a2018] font-medium py-1.5 px-3 hover:bg-[#f0e3c8] rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back to Menu</span>
        </button>
        <h2 className="text-base sm:text-lg font-display font-bold text-[#2a2018] tracking-[0.08em]">
          PROPHETIC DICTIONARY
        </h2>
        <div className="text-[10px] text-[#6b5537] psunken px-2.5 py-1 rounded font-bold uppercase tracking-wider">
          Study Guide
        </div>
      </div>

      {/* Intro text */}
      <div className="psunken p-5 rounded-2xl space-y-3 text-center md:text-left flex flex-col md:flex-row items-center gap-5">
        <div className="p-3.5 bg-[#f4dca6] text-[#92400e] rounded-full border border-[#e6c98a]">
          <BookOpen className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="font-display font-bold text-[#2a2018] text-base flex items-center justify-center md:justify-start gap-1.5 tracking-wide">
            SDA Last Day Events Companion <Sparkles className="w-4 h-4 text-[#b45309]" aria-hidden="true" />
          </h3>
          <p className="text-xs sm:text-sm text-[#52412c] leading-relaxed">
            Browse all {allWordsList.length} prophetic terms across {chaptersData.length} chapters. Each entry includes a clue, expert clue, scripture, and significance summary.
          </p>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b5537]" aria-hidden="true" />
        <input
          type="text"
          aria-label="Search prophetic terms"
          placeholder="Search terms, expert clues, verses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#fbf5e9] border border-[#e2d2ac] rounded-lg text-sm text-[#2a2018] placeholder-[#6b5537] focus:outline-none focus:ring-2 focus:ring-[#b45309] focus:border-[#b45309] parchment-glow"
        />
      </div>

      {/* Search Results Display */}
      {searchResults !== null ? (
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-[#6b5537] tracking-wider uppercase">
            Search Results ({searchResults.length})
          </h4>
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#6b5537] italic">
              No matching terms found. Try searching for “rain”, “seal”, or “Sunday”.
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ chapterTitle, word }) => (
                <div
                  key={word.id}
                  className="pcard rounded-xl p-5 parchment-glow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-[#6b5537] psunken px-2 py-0.5 rounded">
                      {chapterTitle}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#5c4a33]">
                      {word.verse}
                    </span>
                  </div>
                  <h5 className="text-lg font-display font-bold tracking-wide text-[#2a2018]">
                    {word.word}
                  </h5>
                  <p className="text-xs italic text-[#52412c]">
                    <strong>Clue:</strong> “{word.clue}”
                  </p>
                  {word.expertClue && (
                    <p className="text-xs italic text-[#92400e] bg-[#fbeccb] px-2 py-1 rounded border border-[#e6c98a]">
                      <strong>Expert:</strong> “{word.expertClue}”
                    </p>
                  )}
                  <div className="border-l-2 border-[#b45309] pl-3 py-1 psunken rounded-r">
                    <p className="text-base font-scripture italic text-[#2a2018] leading-relaxed">
                      “{word.scripture}”
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-[#52412c] leading-relaxed pt-1">
                    {word.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Standard Chapter Accordion View */
        <div className="space-y-3">
          {chaptersData.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;

            return (
              <div
                key={chapter.id}
                className="pcard rounded-xl overflow-hidden parchment-glow transition-all"
              >
                {/* Chapter trigger row */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between p-4 bg-[#f3e8cf]/60 hover:bg-[#f0e3c8] transition-colors cursor-pointer text-left"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-base font-display font-bold text-[#2a2018] tracking-wide">
                      {chapter.title}
                    </h4>
                    <p className="text-[10px] text-[#6b5537] uppercase font-semibold tracking-wider">
                      {chapter.words.length} Key Prophetic Terms
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#6b5537]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#6b5537]" aria-hidden="true" />
                  )}
                </button>

                {/* Words list container */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={rm ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#e2d2ac] bg-[#fbf5e9]"
                    >
                      <div className="p-4 space-y-3 divide-y divide-[#ecdfc2]">
                        <p className="text-xs text-[#5c4a33] leading-relaxed pb-2 italic">
                          {chapter.description}
                        </p>

                        {chapter.words.map((word) => {
                          const isWordExpanded = expandedWordId === word.id;

                          return (
                            <div key={word.id} className="pt-3 first:pt-0">
                              <button
                                onClick={() => toggleWord(word.id)}
                                aria-expanded={isWordExpanded}
                                className="w-full flex items-center justify-between text-left font-semibold text-[#2a2018] text-sm py-1 cursor-pointer hover:text-[#92400e]"
                              >
                                <span>{word.word}</span>
                                <span className="text-xs font-mono font-bold text-[#6b5537] mr-2">
                                  {word.verse}
                                </span>
                              </button>

                              {isWordExpanded && (
                                <motion.div
                                  initial={rm ? false : { opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-2.5 pl-3 border-l border-[#d8c391] space-y-2.5 text-xs text-[#52412c]"
                                >
                                  <p className="italic">
                                    <strong>Clue:</strong> “{word.clue}”
                                  </p>
                                  {word.expertClue && (
                                    <p className="italic text-[#92400e] bg-[#fbeccb] px-2 py-1.5 rounded border border-[#e6c98a]">
                                      <strong>Expert Clue:</strong> “{word.expertClue}”
                                    </p>
                                  )}
                                  <div className="psunken p-3 rounded font-scripture italic text-[#2a2018] leading-relaxed text-base">
                                    “{word.scripture}”
                                  </div>
                                  <p className="text-xs text-[#52412c] leading-relaxed bg-[#f3e8cf]/60 p-2 rounded border border-[#ecdfc2]">
                                    <strong>Significance:</strong> {word.summary}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
