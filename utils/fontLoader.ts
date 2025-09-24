import * as Font from "expo-font";

let fontsLoaded = false;

export const loadFonts = async (): Promise<boolean> => {
  if (fontsLoaded) return true;

  try {
    await Font.loadAsync({
      // El yazısı fontları
      "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
      "DancingScript-Regular": require("../assets/fonts/DancingScript-Regular.ttf"),
      GreatVibes: require("../assets/fonts/GreatVibes-Regular.ttf"),

      // Modern fontlar
      "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
      "Lora-Regular": require("../assets/fonts/Lora-Regular.ttf"),

      // Özel fontlar
      "Pacifico-Regular": require("../assets/fonts/Pacifico-Regular.ttf"),
      "CourierPrime-Regular": require("../assets/fonts/CourierPrime-Regular.ttf"),
      "CrimsonText-Regular": require("../assets/fonts/CrimsonText-Regular.ttf"),
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    fontsLoaded = true;
    return true;
  } catch (error) {
    return false;
  }
};

export const getFontFamily = (selectedFont?: string): string => {
  if (!selectedFont) {
    return "Nunito-Regular"; // varsayılan font
  }

  // Font mapping - constants/Fonts.ts'teki value'lar ile eşleşmeli
  const fontMap: { [key: string]: string } = {
    "Caveat-Regular": "Caveat-Regular",
    "DancingScript-Regular": "DancingScript-Regular",
    GreatVibes: "GreatVibes",
    "Lora-Regular": "Lora-Regular",
    "CrimsonText-Regular": "CrimsonText-Regular",
    "Nunito-Regular": "Nunito-Regular",
    SpaceMono: "SpaceMono",
    "CourierPrime-Regular": "CourierPrime-Regular",
    "Pacifico-Regular": "Pacifico-Regular",
  };

  const mappedFont = fontMap[selectedFont] || "Nunito-Regular";
  return mappedFont;
};

export const areFontsLoaded = (): boolean => fontsLoaded;
