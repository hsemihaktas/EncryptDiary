export type FontOption = {
  name: string;
  value: string;
  category: string;
  description: string;
};

export const AVAILABLE_FONTS: FontOption[] = [
  // El Yazısı / Handwriting
  {
    name: "Caveat",
    value: "Caveat-Regular",
    category: "El Yazısı",
    description: "Modern casual yazı",
  },
  {
    name: "Dancing Script",
    value: "DancingScript-Regular",
    category: "El Yazısı",
    description: "Zarif script yazı",
  },
  {
    name: "Great Vibes",
    value: "GreatVibes",
    category: "El Yazısı",
    description: "Elegant handwriting",
  },

  // Serif (Kitap Tarzı)
  {
    name: "Lora",
    value: "Lora-Regular",
    category: "Kitap",
    description: "Okunabilir serif",
  },
  {
    name: "Crimson Text",
    value: "CrimsonText-Regular",
    category: "Kitap",
    description: "Klasik kitap fontu",
  },

  // Sans Serif (Modern)
  {
    name: "Nunito",
    value: "Nunito-Regular",
    category: "Modern",
    description: "Friendly ve yumuşak",
  },
  {
    name: "Space Mono",
    value: "SpaceMono",
    category: "Modern",
    description: "Modern monospace",
  },

  // Typewriter
  {
    name: "Courier Prime",
    value: "CourierPrime-Regular",
    category: "Typewriter",
    description: "Nostaljik daktilo",
  },

  // Dekoratif
  {
    name: "Pacifico",
    value: "Pacifico-Regular",
    category: "Dekoratif",
    description: "Retro surf tarzı",
  },
];

export const FONT_CATEGORIES = [
  "El Yazısı",
  "Kitap",
  "Modern",
  "Typewriter",
  "Dekoratif",
];
