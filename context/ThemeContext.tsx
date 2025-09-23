import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = {
  id: string;
  name: string;
  description: string;
  // Color scheme
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cardBackground: string;
  inputBackground: string;
  borderColor: string;
  isDark: boolean;
};

export const THEME_COLORS: ThemeColor[] = [
  {
    id: "default",
    name: "Klasik Beyaz",
    description: "Temiz ve minimal",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    primaryColor: "#2563eb",
    secondaryColor: "#3b82f6",
    buttonColor: "#1d4ed8",
    buttonTextColor: "#ffffff",
    cardBackground: "#f8fafc",
    inputBackground: "#ffffff",
    borderColor: "#e2e8f0",
    isDark: false,
  },
  {
    id: "warm",
    name: "Çöl Güneşi",
    description: "Sıcak turuncu arkaplan",
    backgroundColor: "#fed7aa",
    textColor: "#7c2d12",
    primaryColor: "#ea580c",
    secondaryColor: "#fb923c",
    buttonColor: "#dc2626",
    buttonTextColor: "#ffffff",
    cardBackground: "#fff7ed",
    inputBackground: "#ffffff",
    borderColor: "#fdba74",
    isDark: false,
  },
  {
    id: "cool",
    name: "Arktik Buzul",
    description: "Mavi buzul arkaplan",
    backgroundColor: "#cffafe",
    textColor: "#0c4a6e",
    primaryColor: "#0891b2",
    secondaryColor: "#06b6d4",
    buttonColor: "#0284c7",
    buttonTextColor: "#ffffff",
    cardBackground: "#f0fdff",
    inputBackground: "#ffffff",
    borderColor: "#67e8f9",
    isDark: false,
  },
  {
    id: "nature",
    name: "Orman Yeşili",
    description: "Koyu yeşil orman",
    backgroundColor: "#dcfce7",
    textColor: "#14532d",
    primaryColor: "#15803d",
    secondaryColor: "#22c55e",
    buttonColor: "#16a34a",
    buttonTextColor: "#ffffff",
    cardBackground: "#f0fdf4",
    inputBackground: "#ffffff",
    borderColor: "#86efac",
    isDark: false,
  },
  {
    id: "sunset",
    name: "Altın Gün Batımı",
    description: "Sıcak altın sarısı",
    backgroundColor: "#fef3c7",
    textColor: "#92400e",
    primaryColor: "#d97706",
    secondaryColor: "#f59e0b",
    buttonColor: "#b45309",
    buttonTextColor: "#ffffff",
    cardBackground: "#fffbeb",
    inputBackground: "#ffffff",
    borderColor: "#fcd34d",
    isDark: false,
  },
  {
    id: "lavender",
    name: "Kraliyet Moru",
    description: "Derin mor kraliyet",
    backgroundColor: "#f3e8ff",
    textColor: "#581c87",
    primaryColor: "#7c3aed",
    secondaryColor: "#a855f7",
    buttonColor: "#8b5cf6",
    buttonTextColor: "#ffffff",
    cardBackground: "#faf5ff",
    inputBackground: "#ffffff",
    borderColor: "#c4b5fd",
    isDark: false,
  },
  {
    id: "rose",
    name: "Vintage Rose",
    description: "Pastel gül bahçesi",
    backgroundColor: "#ffe4e6",
    textColor: "#881337",
    primaryColor: "#be123c",
    secondaryColor: "#e11d48",
    buttonColor: "#dc2626",
    buttonTextColor: "#ffffff",
    cardBackground: "#fff1f2",
    inputBackground: "#ffffff",
    borderColor: "#fda4af",
    isDark: false,
  },
  {
    id: "dark",
    name: "Gece Siyahı",
    description: "Yumuşak koyu tema",
    backgroundColor: "#1a1a1a",
    textColor: "#f5f5f5",
    primaryColor: "#60a5fa",
    secondaryColor: "#3b82f6",
    buttonColor: "#2563eb",
    buttonTextColor: "#ffffff",
    cardBackground: "#2a2a2a",
    inputBackground: "#333333",
    borderColor: "#404040",
    isDark: true,
  },
];

type ThemeContextType = {
  currentTheme: ThemeColor;
  setTheme: (themeId: string) => Promise<void>;
  // Direct access to theme colors
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cardBackground: string;
  inputBackground: string;
  borderColor: string;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(THEME_COLORS[0]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeId = await AsyncStorage.getItem("app_theme");
        if (savedThemeId) {
          const theme = THEME_COLORS.find((t) => t.id === savedThemeId);
          if (theme) {
            setCurrentTheme(theme);
          }
        }
      } catch (error) {
        console.error("Theme yüklenirken hata:", error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (themeId: string) => {
    try {
      const theme = THEME_COLORS.find((t) => t.id === themeId);
      if (theme) {
        await AsyncStorage.setItem("app_theme", themeId);
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error("Theme kaydedilirken hata:", error);
    }
  };

  const backgroundColor = currentTheme.backgroundColor;
  const textColor = currentTheme.textColor;
  const primaryColor = currentTheme.primaryColor;
  const secondaryColor = currentTheme.secondaryColor;
  const buttonColor = currentTheme.buttonColor;
  const buttonTextColor = currentTheme.buttonTextColor;
  const cardBackground = currentTheme.cardBackground;
  const inputBackground = currentTheme.inputBackground;
  const borderColor = currentTheme.borderColor;
  const isDark = currentTheme.isDark;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        backgroundColor,
        textColor,
        primaryColor,
        secondaryColor,
        buttonColor,
        buttonTextColor,
        cardBackground,
        inputBackground,
        borderColor,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
