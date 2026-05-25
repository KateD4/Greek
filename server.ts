import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const PORT = 3000;

// Lazy initialization pattern for GoogleGenAI to ensure safe startup
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Convert Raw PCM 16-bit Mono (24000Hz) to Standard WAV
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const wavHeader = Buffer.alloc(44);
  const blockAlign = 2; // 1 channel * (16 bits / 8)
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;

  // RIFF identifier
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(fileSize, 4);
  // WAVE format
  wavHeader.write("WAVE", 8);
  // format chunk identifier
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16); // Chunk size
  wavHeader.writeUInt16LE(1, 20);   // Audio format 1 (PCM)
  wavHeader.writeUInt16LE(1, 22);   // Number of channels (1 = mono)
  wavHeader.writeUInt32LE(sampleRate, 24); // Sample rate
  wavHeader.writeUInt32LE(byteRate, 28);   // Byte rate
  wavHeader.writeUInt16LE(blockAlign, 32); // Block align
  wavHeader.writeUInt16LE(16, 34);  // Bits per sample (16-bit)
  // data chunk identifier
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", keyAvailable: !!process.env.GEMINI_API_KEY });
  });

  // API: Convert Greek Text to Speech
  app.post("/api/generate-tts", async (req, res) => {
    try {
      const { text, style, voice } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "No text provided" });
      }

      const client = getAiClient();
      const styleVibe = style || "attic";
      const voiceName = voice || "Kore";

      // Build specialized instructions for TTS reciting
      let pronunciationGuides = "";
      if (styleVibe === "attic") {
        pronunciationGuides = "using the Reconstructed Attic (classical 5th Century BC Athens) pronunciation. Distinctly sound out rough breathings with a [h] sound. Pronounce theta, phi, chi as aspirated stops ([tʰ], [pʰ], [kʰ]) and NOT as fricatives. Do not use modern Greek sounds.";
      } else if (styleVibe === "erasmian") {
        pronunciationGuides = "using the traditional Western Academic Erasmian pronunciation. Pronounce eta as long [eː], beta as [b], theta as [θ], phi as [f], and chi as [x]. Read as typically taught in classical academic circles.";
      } else if (styleVibe === "modern") {
        pronunciationGuides = "using Modern Greek pronunciation norms. Apply modern phonetic rules where beta is [v], eta/iota/upsilon/ei/oi/yi are all pronounced [i], delta is [ð], and theta is [θ]. Recite fluently as a modern speaker reading historical texts.";
      }

      const prompt = `You are an expert classicist reciting ancient Greek literature. 
Please read the following text exactly as written, with a slow, clear, rhythmic, and beautiful delivery, ${pronunciationGuides}
Only speak the Greek text. Do not introduce it, do not say anything before or after, and do not include any English or commentary.

Greek Text:
${text}`;

      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No voice synthesis could be retrieved from current model response.");
      }

      // Convert raw 24kHz Mono PCM audio to playable WAV
      const rawPcm = Buffer.from(base64Audio, "base64");
      const wavBuffer = pcmToWav(rawPcm, 24000);

      res.json({
        success: true,
        wavBase64: wavBuffer.toString("base64"),
      });
    } catch (error: any) {
      console.error("TTS generation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during speech conversion" });
    }
  });

  // API: Analyze & Parse Ancient Greek Linguistics
  app.post("/api/analyze-text", async (req, res) => {
    try {
      const { text, style } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "No text provided" });
      }

      const client = getAiClient();
      const styleVibe = style || "attic";

      const prompt = `Analyze the following Ancient Greek text under the "${styleVibe}" historical pronunciation framework:
"${text}"

Provide:
1. A literary translation reflecting its poetic/theological/philosophical richness.
2. A literal word-by-word or close lexical translation.
3. A brief academic commentary discussing context, poetic meter, grammatical nuances, or historical context.
4. A word-by-word tokenized array breakdown where each word has its original orthography, English character transliteration, phonetic transcription in IPA (reflecting ${styleVibe} pronunciation), lemma form, contextual meaning, and detailed parsed grammar (part of speech, case, gender, number, person, tense, mood, etc.).`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: {
                type: Type.STRING,
                description: "A polished literary English translation of the entire passage.",
              },
              literalTranslation: {
                type: Type.STRING,
                description: "A close literal grammatical translation of the entire passage.",
              },
              commentary: {
                type: Type.STRING,
                description: "Clean scholarly, historical, or literary commentary about the passage.",
              },
              words: {
                type: Type.ARRAY,
                description: "Word-by-word grammatical and phonetic analysis, in sequential order.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: {
                      type: Type.STRING,
                      description: "The original Greek word as spelled in the passage, preserving accents.",
                    },
                    transliteration: {
                      type: Type.STRING,
                      description: "English transliteration of the word.",
                    },
                    phonetic: {
                      type: Type.STRING,
                      description: "Phonetic IPA spelling reflecting the selected pronunciation style.",
                    },
                    lemma: {
                      type: Type.STRING,
                      description: "The dictionary entry (dictionary citation) form of the word.",
                    },
                    meaning: {
                      type: Type.STRING,
                      description: "English translation/definition in this context.",
                    },
                    grammar: {
                      type: Type.STRING,
                      description: "Morphological analysis (e.g. Noun, fem, acc pl / Verb, aorist, active, 3rd sg).",
                    },
                  },
                  required: ["original", "transliteration", "phonetic", "lemma", "meaning", "grammar"],
                },
              },
            },
            required: ["translation", "literalTranslation", "commentary", "words"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty analysis result from the linguistic model.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      res.json({
        success: true,
        data: parsedJSON,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message || "An error occurred during linguistic parsing" });
    }
  });

  // Client Bundle serving & Hot Reloading integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
