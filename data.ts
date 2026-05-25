import { PresetText, VoiceOption } from "./types";

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    value: "Kore",
    label: "Kore",
    gender: "female",
    description: "Clear, youthful, and resonant female voice."
  },
  {
    value: "Puck",
    label: "Puck",
    gender: "male",
    description: "Warm, expressive, and friendly male orator."
  },
  {
    value: "Charon",
    label: "Charon",
    gender: "male",
    description: "Wise, slow, and ancient/grave-toned masculine voice."
  },
  {
    value: "Fenrir",
    label: "Fenrir",
    gender: "neutral",
    description: "Stately, dark, and enigmatic dramatic tone."
  },
  {
    value: "Zephyr",
    label: "Zephyr",
    gender: "female",
    description: "Soft, gentle, and breathy classical delivery."
  }
];

export const PRESET_TEXTS: PresetText[] = [
  {
    id: "homer-iliad",
    title: "The Iliad — Opening Lines",
    author: "Homer",
    greekText: "μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος\nοὐλομένην, ἣ μυρί᾽ Ἀχαιοῖς ἄλγε᾽ ἔθηκε,\nπολλὰς δ᾽ ἰφθίμους ψυχὰς Ἄϊδι προΐαψεν\nἡρώων, αὐτοὺς δὲ ἑλώρια τεῦχε κύνεσσιν\nοἰωνοῖσί τε πᾶσι, Διὸς δ᾽ ἐτελείετο βουλή,\nἐξ οὗ δὴ τὰ πρῶτα διαστήτην ἐρίσαντε\nἈτρεΐδης τε ἄναξ ἀνδρῶν καὶ δῖος Ἀχιλλεύς.",
    englishTranslation: "Sing, Goddess, the anger of Peleus' son Achilles, accursed, which brought countless pains upon the Achaeans, and sent down to Hades many valiant souls of heroes, and made their bodies spoil for dogs and all birds—and the will of Zeus was accomplished—from the time when first they parted in strife, Atreus' son, king of men, and noble Achilles."
  },
  {
    id: "plato-cave",
    title: "The Republic — Allegory of the Cave",
    author: "Plato",
    greekText: "μετὰ ταῦτα δή, εἶπον, ἀπείκασον τοιούτῳ πάθει τὴν ἡμετέραν φύσιν παιδείας τε πέρι καὶ ἀπαιδευσίας. ἰδὲ γὰρ ἀνθρώπους οἷον ἐν καταγείῳ οἰκήσει σπηλαιώδει, ἀναπεπταμένην πρὸς τὸ φῶς τὴν εἴσοδον ἐχούσῃ μακρὰν παρὰ πᾶν τὸ σπήλαιον.",
    englishTranslation: "And now, I said, let me show in a figure how far our nature is enlightened or unenlightened: Behold! human beings living in a underground cave, which has a mouth open towards the light and reaching all along the cave."
  },
  {
    id: "john-prologue",
    title: "Gospel of John — Prologue",
    author: "Biblical Koine",
    greekText: "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος. οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν. πάντα δι᾽ αὐτοῦ ἐγένετο, καὶ χωρὶς αὐτοῦ ἐγένετο οὐδὲ ἕν ὃ γέγονεν. ἐν αὐτῷ ζωὴ ἦν, καὶ ἡ ζωὴ ἦν τὸ φῶς τῶν ἀνθρώπων.",
    englishTranslation: "In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things were made through Him, and without Him was not any thing made that was made. In Him was life, and the life was the light of men."
  },
  {
    id: "sappho-31",
    title: "Fragment 31 — Equal to the Gods",
    author: "Sappho",
    greekText: "φαίνεταί μοι κῆνος ἴσος θέοισιν\nἔμμεν᾽ ὤνηρ, ὄττις ἐνάντιός τοι\nἰζάνει καὶ πλάσιον ἆδυ φωνεί-\nσας ὑπακούει\nκαὶ γελαίσας ἰμέροεν.",
    englishTranslation: "He seems to me equal to the gods, that man who sits opposite you, and listens closely to your sweet voice and lovely laughter."
  }
];
