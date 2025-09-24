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
  buttonColor: string;
  buttonTextColor: string;
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
    buttonColor: "#1d4ed8",
    buttonTextColor: "#ffffff",
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
    buttonColor: "#dc2626",
    buttonTextColor: "#ffffff",
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
    buttonColor: "#0284c7",
    buttonTextColor: "#ffffff",
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
    buttonColor: "#16a34a",
    buttonTextColor: "#ffffff",
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
    buttonColor: "#b45309",
    buttonTextColor: "#ffffff",
    inputBackground: "#ffffff",
    borderColor: "#fcd34d",
    isDark: false,
  },
  {
    id: "rose",
    name: "Vintage Rose",
    description: "Pastel gül bahçesi",
    backgroundColor: "#ffe4e6",
    textColor: "#881337",
    primaryColor: "#be123c",
    buttonColor: "#dc2626",
    buttonTextColor: "#ffffff",
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
    buttonColor: "#2563eb",
    buttonTextColor: "#ffffff",
    inputBackground: "#333333",
    borderColor: "#404040",
    isDark: true,
  },
];

// Custom theme placeholder for theme selector
export const CUSTOM_THEME_PLACEHOLDER: ThemeColor = {
  id: "custom",
  name: "Özel Tema",
  description: "Kendi temanı oluştur",
  backgroundColor: "#f0f0f0",
  textColor: "#1a1a1a",
  primaryColor: "#6366f1",
  buttonColor: "#5b21b6",
  buttonTextColor: "#ffffff",
  inputBackground: "#ffffff",
  borderColor: "#e2e8f0",
  isDark: false,
};

type ThemeContextType = {
  currentTheme: ThemeColor;
  setTheme: (themeId: string) => Promise<void>;
  // Custom theme functions
  createCustomTheme: (theme: Partial<ThemeColor>) => Promise<void>;
  updateCustomTheme: (updates: Partial<ThemeColor>) => Promise<void>;
  getCustomTheme: () => ThemeColor | null;
  resetToDefault: () => Promise<void>;
  // Direct access to theme colors
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  inputBackground: string;
  borderColor: string;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(THEME_COLORS[0]);
  const [customTheme, setCustomTheme] = useState<ThemeColor | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeId = await AsyncStorage.getItem("app_theme");
        const savedCustomTheme = await AsyncStorage.getItem("custom_theme");

        // Load custom theme if exists
        if (savedCustomTheme) {
          const customThemeData = JSON.parse(savedCustomTheme);
          setCustomTheme(customThemeData);
        }

        if (savedThemeId) {
          if (savedThemeId === "custom" && customTheme) {
            setCurrentTheme(customTheme);
          } else {
            const theme = THEME_COLORS.find((t) => t.id === savedThemeId);
            if (theme) {
              setCurrentTheme(theme);
            }
          }
        }
      } catch (error) {
        console.error("Theme yüklenirken hata:", error);
      }
    };
    loadTheme();
  }, [customTheme]);

  const setTheme = async (themeId: string) => {
    try {
      if (themeId === "custom" && customTheme) {
        await AsyncStorage.setItem("app_theme", themeId);
        setCurrentTheme(customTheme);
      } else {
        const theme = THEME_COLORS.find((t) => t.id === themeId);
        if (theme) {
          await AsyncStorage.setItem("app_theme", themeId);
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error("Theme kaydedilirken hata:", error);
    }
  };

  const createCustomTheme = async (themeData: Partial<ThemeColor>) => {
    try {
      const newCustomTheme: ThemeColor = {
        id: "custom",
        name: themeData.name || "Özel Tema",
        description:
          themeData.description || "Kullanıcı tarafından özelleştirildi",
        backgroundColor: themeData.backgroundColor || "#ffffff",
        textColor: themeData.textColor || "#1a1a1a",
        primaryColor: themeData.primaryColor || "#2563eb",
        buttonColor: themeData.buttonColor || "#1d4ed8",
        buttonTextColor: themeData.buttonTextColor || "#ffffff",
        inputBackground: themeData.inputBackground || "#ffffff",
        borderColor: themeData.borderColor || "#e2e8f0",
        isDark: themeData.isDark || false,
      };

      await AsyncStorage.setItem(
        "custom_theme",
        JSON.stringify(newCustomTheme)
      );
      setCustomTheme(newCustomTheme);
      await setTheme("custom");
    } catch (error) {
      console.error("Custom theme oluşturulurken hata:", error);
    }
  };

  const updateCustomTheme = async (updates: Partial<ThemeColor>) => {
    try {
      if (!customTheme) return;

      const updatedTheme = { ...customTheme, ...updates };
      await AsyncStorage.setItem("custom_theme", JSON.stringify(updatedTheme));
      setCustomTheme(updatedTheme);

      if (currentTheme.id === "custom") {
        setCurrentTheme(updatedTheme);
      }
    } catch (error) {
      console.error("Custom theme güncellenirken hata:", error);
    }
  };

  const getCustomTheme = () => {
    return customTheme;
  };

  const resetToDefault = async () => {
    try {
      await AsyncStorage.removeItem("custom_theme");
      await AsyncStorage.setItem("app_theme", "default");
      setCustomTheme(null);
      setCurrentTheme(THEME_COLORS[0]);
    } catch (error) {
      console.error("Tema sıfırlanırken hata:", error);
    }
  };

  const backgroundColor = currentTheme.backgroundColor;
  const textColor = currentTheme.textColor;
  const primaryColor = currentTheme.primaryColor;
  const buttonColor = currentTheme.buttonColor;
  const buttonTextColor = currentTheme.buttonTextColor;
  const inputBackground = currentTheme.inputBackground;
  const borderColor = currentTheme.borderColor;
  const isDark = currentTheme.isDark;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        createCustomTheme,
        updateCustomTheme,
        getCustomTheme,
        resetToDefault,
        backgroundColor,
        textColor,
        primaryColor,
        buttonColor,
        buttonTextColor,
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
