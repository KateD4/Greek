import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Globe, HelpCircle, Loader2, RefreshCw, Volume2, BookOpen } from "lucide-react";
import { PRESET_TEXTS, VOICE_OPTIONS } from "./data";
import { AnalysisResponse, PronunciationStyle } from "./types";
import PolytonicHelper from "./components/PolytonicHelper";
import AnalysisPanel from "./components/AnalysisPanel";

export default function App() {
  const [greekText, setGreekText] = useState(PRESET_TEXTS[0].greekText);
  const [selectedStyle, setSelectedStyle] = useState<PronunciationStyle>("attic");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].value);
  
  // Loading indicators
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // API output states
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize with Homeric epic text preset or whatever selected
  const handleSelectPreset = (id: string) => {
    const preset = PRESET_TEXTS.find((p) => p.id === id);
    if (preset) {
      setGreekText(preset.greekText);
      // Automatically clean up previous audio/analysis
      setAudioBase64(null);
      setIsPlaying(false);
      setErrorMessage(null);
    }
  };

  // Helper function to insert Greek polytonic accent directly into cursor position
  const handleInsertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = greekText.substring(0, start) + char + greekText.substring(end);
    
    setGreekText(newText);
    
    // Position cursor right after the newly inserted character
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  // Synchronous audio element status tracking
  useEffect(() => {
    if (audioBase64) {
      const audioUrl = `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setErrorMessage("Audio playback engine failed to read generated stream.");
      };
      
      audioRef.current = audio;
      return () => {
        audio.pause();
        audioRef.current = null;
      };
    } else {
      audioRef.current = null;
    }
  }, [audioBase64]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Audio play error:", err);
          setErrorMessage("Failed to start sound playback.");
        });
    }
  };

  // Single monolithic synthesis step calling TTS & optional analysis parallelly
  const handleSynthesizeAndAnalyze = async () => {
    if (!greekText.trim()) {
      setErrorMessage("Please input Greek text to convert and clarify.");
      return;
    }

    setErrorMessage(null);
    setIsGeneratingTts(true);
    setIsAnalyzing(true);
    setAudioBase64(null);
    setIsPlaying(false);

    try {
      // 1. Fire synthesis endpoint
      const ttsPromise = fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: greekText,
          style: selectedStyle,
          voice: selectedVoice
        })
      });

      // 2. Fire linguistic analysis endpoint
      const analysisPromise = fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: greekText,
          style: selectedStyle
        })
      });

      const [ttsRes, analysisRes] = await Promise.all([ttsPromise, analysisPromise]);

      if (!ttsRes.ok) {
        const errObj = await ttsRes.json().catch(() => ({}));
        throw new Error(errObj.error || "Speech conversion server failure");
      }
      if (!analysisRes.ok) {
        const errObj = await analysisRes.json().catch(() => ({}));
        throw new Error(errObj.error || "Academic analysis server failure");
      }

      const ttsData = await ttsRes.json();
      const anaData = await analysisRes.json();

      if (ttsData.success && ttsData.wavBase64) {
        setAudioBase64(ttsData.wavBase64);
      } else {
        throw new Error("No synthesized sound bytes returned.");
      }

      if (anaData.success && anaData.data) {
        setAnalysisData(anaData.data);
      } else {
        throw new Error("No scholarly parsed results found.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGeneratingTts(false);
      setIsAnalyzing(false);
    }
  };

  // Quick word counter & time estimation based on classical reading rate
  const wordCount = greekText.trim() ? greekText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(1, Math.round(wordCount * 1.4)); // ~40 words/min
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-serif flex flex-col selection:bg-[#1A1A1A] selection:text-white">
      {/* Header Section */}
      <header className="flex justify-between items-baseline p-8 md:p-10 border-b border-[#1A1A1A]/80">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter leading-none">λόγος</h1>
          <span className="text-xs uppercase tracking-widest font-sans font-bold opacity-60">Ancient Greek Synthesizer & Gloss</span>
        </div>
        <nav className="hidden md:flex gap-8 font-sans text-xs uppercase tracking-widest font-bold">
          <span className="border-b-2 border-[#1A1A1A] pb-1 cursor-pointer">Synthesizer</span>
          <span className="opacity-40 cursor-default">Phonetics</span>
          <span className="opacity-40 cursor-default">Grammar Codex</span>
        </nav>
      </header>

      {/* Main Multi-Pane Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row border-b border-[#1A1A1A]">
        
        {/* Left Section: Input Area, Presets, Accent Helpers */}
        <section className="flex-1 lg:w-[65%] p-6 md:p-10 flex flex-col relative border-b lg:border-b-0 lg:border-r border-[#1A1A1A]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] font-bold opacity-50">
              Input Corpus / Liturgies & Epics
            </span>
            
            {/* Quick Presets Menu */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[9px] font-sans uppercase font-semibold text-[#8a6d3b] mr-2">Presets:</span>
              {PRESET_TEXTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className="px-2.5 py-1 text-[10px] font-sans border border-[#1A1A1A]/20 rounded-md hover:bg-[#1A1A1A]/5 transition text-left cursor-pointer"
                >
                  {preset.author} — {preset.title.split(" — ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Greek Epic Textarea */}
          <div className="flex-1 min-h-[220px] flex flex-col mb-4">
            <textarea
              ref={textareaRef}
              value={greekText}
              onChange={(e) => setGreekText(e.target.value)}
              placeholder="Type or paste your Ancient Greek polytonic corpus here..."
              className="w-full flex-1 bg-transparent border-0 resize-none font-serif text-2xl md:text-3xl leading-relaxed text-[#2A2A2A] italic focus:outline-hidden placeholder:opacity-30 placeholder:italic transition-all"
              style={{ minHeight: "180px" }}
              dir="ltr"
            />
          </div>

          {/* Polytonic accent panel */}
          <div className="mb-6">
            <PolytonicHelper onInsertChar={handleInsertChar} />
          </div>

          <div className="h-px w-full bg-[#1A1A1A] opacity-20 my-6"></div>

          {/* Action Trigger Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 md:gap-12">
              <button
                onClick={handleSynthesizeAndAnalyze}
                disabled={isGeneratingTts || isAnalyzing}
                className="bg-[#1A1A1A] text-[#F9F7F2] px-8 md:px-12 py-4 md:py-5 font-sans text-xs uppercase tracking-[0.3em] font-bold hover:bg-black disabled:opacity-40 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {(isGeneratingTts || isAnalyzing) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Corpus...</span>
                  </>
                ) : (
                  <span>Synthesize & Analyze</span>
                )}
              </button>

              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-sans uppercase font-bold opacity-50 italic">Word Count</span>
                  <span className="text-lg md:text-xl font-sans font-medium">{wordCount} Words</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-sans uppercase font-bold opacity-50 italic">Est. Audio Duration</span>
                  <span className="text-lg md:text-xl font-sans font-medium">{formatTime(estimatedSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Error alerts */}
            {errorMessage && (
              <div className="flex-1 bg-red-50 border border-red-200 text-red-700 p-2.5 text-xs rounded-lg font-sans leading-relaxed">
                {errorMessage}
              </div>
            )}
          </div>
        </section>

        {/* Right Section: Controls, Parameters & Active Voice Profile */}
        <aside className="lg:w-[35%] bg-[#F4F1EA] p-6 md:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-8">
            
            {/* Historical Pronunciation Config */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold opacity-50">
                Pronunciation Framework
              </h3>
              <div className="grid grid-cols-3 gap-2 font-sans">
                {(["attic", "erasmian", "modern"] as PronunciationStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setSelectedStyle(style);
                      // Clear stale audio outputs to make them regenerate
                      setAudioBase64(null);
                    }}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-md transition cursor-pointer text-center ${
                      selectedStyle === style
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        : "border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#555] font-sans leading-relaxed">
                {selectedStyle === "attic" && "Reconstructed Attic: Classical Athenian pronunciation. Aspiration distinctions, non-fricative aspirated stops."}
                {selectedStyle === "erasmian" && "Erasmian Standard: Western tradition taught in seminaries and traditional classics departments."}
                {selectedStyle === "modern" && "Modern Greek: Standard contemporary pronunciation as spoken by modern Greek natives on historical texts."}
              </p>
            </div>

            {/* Voices list */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold opacity-50">
                Acoustic Speaker Profile
              </h3>
              <div className="space-y-1.5 font-sans">
                {VOICE_OPTIONS.map((voice) => {
                  const isChosen = selectedVoice === voice.value;
                  return (
                    <button
                      key={voice.value}
                      onClick={() => {
                        setSelectedVoice(voice.value);
                        setAudioBase64(null);
                      }}
                      className={`w-full flex items-center justify-between py-2 px-3 border-b border-[#1A1A1A]/10 text-left transition ${
                        isChosen ? "text-[#1A1A1A] font-bold" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A] font-medium"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-base">
                          {voice.label} <span className="text-xs opacity-60 italic">({voice.gender})</span>
                        </span>
                        <span className="text-[10px] opacity-75 font-normal line-clamp-1">{voice.description}</span>
                      </div>
                      {isChosen && <div className="w-3 h-3 bg-[#1A1A1A] rounded-full"></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Waveform & Player Widget */}
            <div className="bg-[#1A1A1A] text-[#F9F7F2] p-6 rounded-lg font-sans">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handlePlayPause}
                  disabled={!audioBase64}
                  className={`w-12 h-12 border border-white flex items-center justify-center rounded-sm hover:bg-white hover:text-black transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 flex gap-1 items-end h-8 overflow-hidden pointer-events-none">
                  {[...Array(24)].map((_, idx) => {
                    // Draw custom graphic bars matching editorial mockup
                    // Random heights modulated when playing, flat otherwise
                    const height = isPlaying 
                      ? Math.floor(Math.sin((idx + Date.now()/150) * 0.7) * 12) + 16
                      : Math.max(4, (idx * 3) % 18 + 4);
                    const opacityClass = idx % 3 === 0 ? "opacity-30" : idx % 3 === 1 ? "opacity-60" : "opacity-90";
                    return (
                      <div
                        key={idx}
                        className={`bg-white w-1 transition-all duration-150 ${opacityClass}`}
                        style={{ height: `${height}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Format description & Export capability */}
              <div className="text-[10px] uppercase tracking-widest font-bold flex justify-between items-center">
                <span>WAV Mono / 24kHz</span>
                {audioBase64 ? (
                  <a
                    href={`data:audio/wav;base64,${audioBase64}`}
                    download={`${selectedStyle}_recital_${selectedVoice}.wav`}
                    className="opacity-80 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download WAV</span>
                  </a>
                ) : (
                  <span className="opacity-40">Ready to recite ↑</span>
                )}
              </div>
            </div>

          </div>
        </aside>
      </main>

      {/* Embedded Analysis / Scholarly Panels Section */}
      <section className="bg-[#Fcfbf8] p-6 md:p-10 border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="border-b border-[#1A1A1A] pb-3 flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight font-sans text-[#1A1A1A]">
              Morphosyntax & Translations
            </h2>
            <p className="text-xs font-mono font-medium text-[#c07d34]">
              {isAnalyzing ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Lexicon compilation in progress...
                </span>
              ) : analysisData ? (
                "✓ Full linguistic model generated successfully"
              ) : (
                "Pending analysis generation"
              )}
            </p>
          </div>

          {isAnalyzing ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center p-12 border border-dashed border-[#1A1A1A]/30 text-center rounded-xl bg-white/40">
              <Loader2 className="w-8 h-8 animate-spin text-[#8a6d3b] mb-3" />
              <p className="font-serif italic text-[#1A1A1A]/70 text-lg">
                Parsing syntax, researching citations, and translating lines under the {selectedStyle} phonology scheme...
              </p>
            </div>
          ) : analysisData ? (
            <div className="animate-fade-in">
              <AnalysisPanel analysis={analysisData} />
            </div>
          ) : (
            <div className="min-h-[250px] flex flex-col items-center justify-center p-12 border border-dashed border-[#1A1A1A]/20 text-center rounded-xl">
              <BookOpen className="w-12 h-12 text-[#1A1A1A]/20 mb-3" />
              <p className="font-serif italic text-lg text-[#1A1A1A]/60">
                Scholarly interlinear gloss commentaries and classical translations will appear here once you click "Synthesize & Analyze".
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer System Status Section */}
      <footer className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase font-sans font-bold tracking-[0.2em] bg-[#F9F7F2]">
        <div className="flex flex-wrap gap-4 md:gap-8 justify-center sm:justify-start">
          <span>Engine: Logos Synthesizer</span>
          <span className="opacity-60">Phonetics Schema: Erasmus-C</span>
          <span className="opacity-60">Model: gemini-3.5-flash / 3.1-tts</span>
        </div>
        <div className="flex gap-6 justify-center">
          <span className="opacity-40 italic">Academy of Classical Linguistics</span>
          <span>© 2026 Logos Synthesizer</span>
        </div>
      </footer>
    </div>
  );
}
