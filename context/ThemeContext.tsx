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
    name: "Varsayılan",
    description: "Açık gri tema",
    backgroundColor: "#f9f9f9",
    textColor: "#1a1a1a",
    primaryColor: "#1782c9",
    secondaryColor: "#2196f3",
    buttonColor: "#007bff",
    buttonTextColor: "#ffffff",
    cardBackground: "#ffffff",
    inputBackground: "#ffffff",
    borderColor: "#ddd",
    isDark: false,
  },
  {
    id: "warm",
    name: "Sıcak",
    description: "Krem rengi tema",
    backgroundColor: "#fdf6e3",
    textColor: "#5d4037",
    primaryColor: "#d84315",
    secondaryColor: "#ff5722",
    buttonColor: "#ff6f00",
    buttonTextColor: "#ffffff",
    cardBackground: "#fff8e1",
    inputBackground: "#ffffff",
    borderColor: "#d7ccc8",
    isDark: false,
  },
  {
    id: "cool",
    name: "Soğuk",
    description: "Açık mavi tema",
    backgroundColor: "#f0f8ff",
    textColor: "#1565c0",
    primaryColor: "#0277bd",
    secondaryColor: "#03a9f4",
    buttonColor: "#2196f3",
    buttonTextColor: "#ffffff",
    cardBackground: "#e3f2fd",
    inputBackground: "#ffffff",
    borderColor: "#bbdefb",
    isDark: false,
  },
  {
    id: "nature",
    name: "Doğa",
    description: "Açık yeşil tema",
    backgroundColor: "#f0fff0",
    textColor: "#2e7d32",
    primaryColor: "#388e3c",
    secondaryColor: "#4caf50",
    buttonColor: "#66bb6a",
    buttonTextColor: "#ffffff",
    cardBackground: "#e8f5e8",
    inputBackground: "#ffffff",
    borderColor: "#c8e6c9",
    isDark: false,
  },
  {
    id: "sunset",
    name: "Gün Batımı",
    description: "Altın sarısı tema",
    backgroundColor: "#fff8dc",
    textColor: "#e65100",
    primaryColor: "#f57c00",
    secondaryColor: "#ff9800",
    buttonColor: "#ffb74d",
    buttonTextColor: "#ffffff",
    cardBackground: "#fff3e0",
    inputBackground: "#ffffff",
    borderColor: "#ffcc80",
    isDark: false,
  },
  {
    id: "lavender",
    name: "Lavanta",
    description: "Açık mor tema",
    backgroundColor: "#f8f0ff",
    textColor: "#4a148c",
    primaryColor: "#7b1fa2",
    secondaryColor: "#9c27b0",
    buttonColor: "#ba68c8",
    buttonTextColor: "#ffffff",
    cardBackground: "#f3e5f5",
    inputBackground: "#ffffff",
    borderColor: "#ce93d8",
    isDark: false,
  },
  {
    id: "rose",
    name: "Gül",
    description: "Açık pembe tema",
    backgroundColor: "#fff0f5",
    textColor: "#ad1457",
    primaryColor: "#c2185b",
    secondaryColor: "#e91e63",
    buttonColor: "#f06292",
    buttonTextColor: "#ffffff",
    cardBackground: "#fce4ec",
    inputBackground: "#ffffff",
    borderColor: "#f8bbd9",
    isDark: false,
  },
  {
    id: "dark",
    name: "Koyu",
    description: "Koyu gri tema",
    backgroundColor: "#2c2c2c",
    textColor: "#ffffff",
    primaryColor: "#4fc3f7",
    secondaryColor: "#29b6f6",
    buttonColor: "#42a5f5",
    buttonTextColor: "#ffffff",
    cardBackground: "#3a3a3a",
    inputBackground: "#424242",
    borderColor: "#555555",
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
