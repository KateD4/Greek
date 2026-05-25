import React, { useState } from "react";
import { BookOpen, HelpCircle, FileText, Globe, GraduationCap } from "lucide-react";
import { AnalysisResponse, AnalyzedWord } from "../types";

interface AnalysisPanelProps {
  analysis: AnalysisResponse;
}

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<"gloss" | "translations" | "commentary">("gloss");
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);

  const wordTokens = analysis?.words || [];

  return (
    <div id="analysis-panel-container" className="bg-[#F9F7F2] border border-[#1A1A1A] flex flex-col h-full">
      
      {/* Tab Switcher Headers with Editorial Style (Square Borders, Stark High Contrast) */}
      <div className="flex border-b border-[#1A1A1A] bg-[#F4F1EA] px-4 pt-3 gap-1">
        <button
          id="tab-gloss-btn"
          type="button"
          onClick={() => {
            setActiveTab("gloss");
            if (wordTokens.length > 0 && !selectedWord) setSelectedWord(wordTokens[0]);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition -mb-[1px] cursor-pointer ${
            activeTab === "gloss"
              ? "bg-[#F9F7F2] border-[#1A1A1A] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Interlinear Gloss & Grammar</span>
        </button>

        <button
          id="tab-trans-btn"
          type="button"
          onClick={() => setActiveTab("translations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition -mb-[1px] cursor-pointer ${
            activeTab === "translations"
              ? "bg-[#F9F7F2] border-[#1A1A1A] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Translations</span>
        </button>

        <button
          id="tab-notes-btn"
          type="button"
          onClick={() => setActiveTab("commentary")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition -mb-[1px] cursor-pointer ${
            activeTab === "commentary"
              ? "bg-[#F9F7F2] border-[#1A1A1A] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Scholarly Commentary</span>
        </button>
      </div>

      {/* Tab Panel Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === "gloss" && (
          <div id="gloss-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-fade-in">
            
            {/* Clickable Interlinear View */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#F4F1EA] border border-[#1A1A1A]/20 p-4">
                <p className="text-[10px] uppercase font-sans tracking-[0.2em] font-bold opacity-50 mb-2">
                  Interactive Recitation Script (Select a word to parse morphology)
                </p>

                {/* Fluent Greek text wrap of words */}
                <div className="flex flex-wrap gap-x-2.5 gap-y-4 font-serif text-xl md:text-2xl leading-relaxed text-[#1A1A1A] py-2">
                  {wordTokens.map((word, index) => {
                    const isSelected = selectedWord?.original === word.original && selectedWord?.grammar === word.grammar;
                    return (
                      <button
                        id={`gloss-word-${index}`}
                        key={index}
                        onClick={() => setSelectedWord(word)}
                        className={`group relative text-left py-1 px-1.5 border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#1A1A1A]/10 border-[#1A1A1A] text-[#1a1a1a]"
                            : "border-transparent hover:bg-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
                        }`}
                      >
                        {/* Greek Spelling */}
                        <span className="block font-semibold border-b border-dashed border-[#1A1A1A]/30">
                          {word.original}
                        </span>
                        {/* Minimal Transliteration */}
                        <span className="block font-sans text-[10px] text-[#1A1A1A]/60 mt-0.5 max-w-[80px] truncate uppercase tracking-tight">
                          {word.transliteration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions and help */}
              <div className="border border-[#1A1A1A]/30 p-4 text-[11px] text-[#1a1a1a]/80 flex items-start gap-2.5 bg-[#F4F1EA]/50 font-sans leading-relaxed">
                <p>
                  <strong>Academic Lexicon Guide:</strong> Touch any of the Greek literary forms above to inspect their precise morphosyntactic category, reconstructed IPA syllabic targets, and lemma dictionary headwords.
                </p>
              </div>
            </div>

            {/* Linguistic Inspection Panel */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[#1A1A1A]/30 pt-6 lg:pt-0 lg:pl-6">
              {selectedWord ? (
                <div id="morphology-card" className="bg-[#F4F1EA] border border-[#1A1A1A] p-5 flex flex-col gap-4 sticky top-0 animate-fade-in">
                  <div className="border-b border-[#1A1A1A]/20 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-sans text-[#1A1A1A]/50 uppercase tracking-[0.25em] font-bold">Linguistic Token</span>
                      <h3 className="font-serif text-3xl font-bold text-[#1A1A1A]">{selectedWord.original}</h3>
                    </div>
                    <span className="font-sans text-xs text-white bg-[#1A1A1A] px-2.5 py-1 font-bold uppercase tracking-wider">
                      {selectedWord.transliteration}
                    </span>
                  </div>

                  {/* Morphological Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-3 bg-[#F9F7F2] border border-[#1A1A1A]/10">
                      <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold mb-1">Dictionary Lemma</span>
                      <span className="font-serif text-lg font-semibold text-[#1A1A1A]">{selectedWord.lemma}</span>
                    </div>

                    <div className="p-3 bg-[#F9F7F2] border border-[#1A1A1A]/10">
                      <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold mb-1">Phonetic (IPA)</span>
                      <span className="font-mono text-sm text-[#1A1A1A] font-semibold">[{selectedWord.phonetic}]</span>
                    </div>

                    <div className="col-span-2 p-3 bg-[#F9F7F2] border border-[#1A1A1A]/10 flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold mb-1">Morphosyntactic Parse</span>
                      <span className="font-sans font-bold text-[#1A1A1A]">{selectedWord.grammar}</span>
                    </div>

                    <div className="col-span-2 p-3 bg-[#F9F7F2] border border-[#1A1A1A]/10">
                      <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block font-bold mb-1">Contextual Meaning</span>
                      <span className="font-sans font-medium text-[#1A1A1A]/80 italic">"{selectedWord.meaning}"</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="empty-morphology-card" className="h-full flex flex-col items-center justify-center text-center p-6 text-[#1A1A1A]/50 border border-dashed border-[#1A1A1A]/30 min-h-[250px]">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-sans font-bold uppercase tracking-wider">Select a Greek word to view full grammar parsing</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "translations" && (
          <div id="translations-pane" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Literary Translation */}
            <div className="bg-[#F4F1EA] border border-[#1A1A1A] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-[#1A1A1A]/20 pb-3 mb-4">
                  <Globe className="w-4 h-4" />
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Literary English Recital</h3>
                </div>
                <p className="font-serif italic text-lg text-[#1A1A1A] leading-relaxed">
                  "{analysis?.translation}"
                </p>
              </div>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-6 leading-relaxed font-sans uppercase tracking-tight">
                A professional literary translation seeking to capture the rhetorical flair and epic weight of the original Greek text.
              </p>
            </div>

            {/* Literal Translation */}
            <div className="bg-[#F4F1EA] border border-[#1A1A1A] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-[#1A1A1A]/20 pb-3 mb-4">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Literal Lexical Gloss</h3>
                </div>
                <p className="font-sans text-xs text-[#1A1A1A] leading-relaxed bg-[#F9F7F2] border border-[#1A1A1A]/10 p-4">
                  {analysis?.literalTranslation}
                </p>
              </div>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-6 leading-relaxed font-sans uppercase tracking-tight">
                An exact interlinear translation focusing strictly on the structural syntactic alignment of each Greek token.
              </p>
            </div>
          </div>
        )}

        {activeTab === "commentary" && (
          <div id="commentary-pane" className="animate-fade-in max-w-4xl">
            <div className="bg-[#F4F1EA] border border-[#1A1A1A] p-6 md:p-8">
              <div className="flex items-center gap-2 border-b border-[#1A1A1A]/20 pb-3 mb-4">
                <GraduationCap className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-widest font-sans text-[#1A1A1A]">Academic Scholarship Notes</h3>
              </div>
              <div className="space-y-4 text-sm md:text-base text-[#2A2A2A] leading-relaxed font-serif">
                {analysis?.commentary ? (
                  analysis.commentary.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>No additional commentary available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
