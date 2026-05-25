export type PronunciationStyle = "attic" | "erasmian" | "modern";

export interface VoiceOption {
  value: string;
  label: string;
  gender: "female" | "male" | "neutral";
  description: string;
}

export interface PresetText {
  id: string;
  title: string;
  author: string;
  greekText: string;
  englishTranslation: string;
}

export interface AnalyzedWord {
  original: string;
  transliteration: string;
  phonetic: string;
  lemma: string;
  meaning: string;
  grammar: string;
}

export interface AnalysisResponse {
  translation: string;
  literalTranslation: string;
  commentary: string;
  words: AnalyzedWord[];
}
