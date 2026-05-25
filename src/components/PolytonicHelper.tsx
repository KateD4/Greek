import React from "react";
import { Keyboard, HelpCircle, Info } from "lucide-react";

interface PolytonicHelperProps {
  onInsertChar: (char: string) => void;
}

export default function PolytonicHelper({ onInsertChar }: PolytonicHelperProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const breathingsAndAccents = [
    { char: "᾽", label: "Smooth Breathing (Psili)", desc: "no 'h' sound (ἀ)" },
    { char: "῾", label: "Rough Breathing (Dasia)", desc: "adds 'h' sound (ἁ)" },
    { char: "́", label: "Acute (Oxeia)", desc: "pitch rise (ά)" },
    { char: "̀", label: "Grave (Bareia)", desc: "neutralized pitch (ὰ)" },
    { char: "͂", label: "Circumflex (Perispomeni)", desc: "rise-fall pitch (ᾶ)" },
    { char: "ͅ", label: "Iota Subscript (Ypogegrammeni)", desc: "silent historical diphthong (ᾳ)" },
  ];

  const commonVowels = [
    { char: "ἀ", desc: "a + smooth" },
    { char: "ἁ", desc: "a + rough" },
    { char: "ᾶ", desc: "a + circumflex" },
    { char: "ἐ", desc: "e + smooth" },
    { char: "ἑ", desc: "e + rough" },
    { char: "ἠ", desc: "ē + smooth" },
    { char: "ἡ", desc: "ē + rough" },
    { char: "ῆ", desc: "ē + circumflex" },
    { char: "ἰ", desc: "i + smooth" },
    { char: "ἱ", desc: "i + rough" },
    { char: "ῖ", desc: "i + circumflex" },
    { char: "ὀ", desc: "o + smooth" },
    { char: "ὁ", desc: "o + rough" },
    { char: "ὑ", desc: "u + rough" },
    { char: "ῦ", desc: "u + circumflex" },
    { char: "ὠ", desc: "ō + smooth" },
    { char: "ὡ", desc: "ō + rough" },
    { char: "ῶ", desc: "ō + circumflex" },
  ];

  return (
    <div id="polytonic-helper-container" className="bg-[#F4F1EA] border border-[#1A1A1A]/30 p-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <button
          id="toggle-helper-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:opacity-85 transition cursor-pointer"
        >
          <Keyboard className="w-4 h-4" />
          <span>Polytonic Accent & Diacritics Pad</span>
          <span className="text-[10px] bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded-sm">
            {isOpen ? "Hide" : "Expand"}
          </span>
        </button>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A]/60 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Tap glyph to insert at cursor focus
        </span>
      </div>

      {isOpen && (
        <div id="helper-drawer" className="mt-4 pt-3 border-t border-[#1A1A1A]/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1 mb-2">
              <span>Classical Pitch Accents</span>
              <HelpCircle className="w-3.5 h-3.5 opacity-50" />
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {breathingsAndAccents.map((item, index) => (
                <button
                  id={`accent-btn-${index}`}
                  key={index}
                  type="button"
                  onClick={() => onInsertChar(item.char)}
                  className="flex items-center justify-between p-1.5 border border-[#1A1A1A]/10 bg-[#F9F7F2] hover:bg-[#1A1A1A]/5 hover:border-[#1A1A1A] text-left transition cursor-pointer"
                >
                  <span className="font-serif text-xl font-bold text-[#1A1A1A] w-7 text-center">{item.char}</span>
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="font-bold text-[#1A1A1A] truncate text-[10px] uppercase tracking-wide">{item.char}</p>
                    <p className="text-[9px] text-[#1A1A1A]/60 truncate italic">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              <span>Standard Polytonic Vowels</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {commonVowels.map((item, idx) => (
                <button
                  id={`vowel-btn-${idx}`}
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(item.char)}
                  className="py-1 px-1.5 text-center font-serif text-base border border-[#1A1A1A]/10 bg-[#F9F7F2] hover:bg-[#1A1A1A]/5 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition cursor-pointer"
                  title={item.desc}
                >
                  {item.char}
                  <span className="block text-[8px] font-sans text-[#1A1A1A]/50 font-bold scale-90 uppercase tracking-tighter">
                    {item.desc.split(" ")[2] || item.desc.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
