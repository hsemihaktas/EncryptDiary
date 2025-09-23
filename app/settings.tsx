import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { THEME_COLORS, useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const {
    currentTheme,
    setTheme,
    backgroundColor,
    textColor,
    primaryColor,
    isDark,
  } = useTheme();

  const handleThemeSelect = async (themeId: string) => {
    await setTheme(themeId);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: primaryColor }]}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎨 Tema Rengi
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: isDark ? "#ccc" : "#666" },
            ]}
          >
            Uygulamanın arkaplan rengini seçin
          </Text>

          <View style={styles.colorGrid}>
            {THEME_COLORS.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: theme.backgroundColor },
                  currentTheme.id === theme.id && styles.selectedColorOption,
                ]}
                onPress={() => handleThemeSelect(theme.id)}
              >
                <View style={styles.colorPreview}>
                  {currentTheme.id === theme.id && (
                    <MaterialIcons name="check" size={24} color="#1782c9ff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.colorName,
                    theme.id === "dark" && { color: "#fff" },
                  ]}
                >
                  {theme.name}
                </Text>
                <Text
                  style={[
                    styles.colorDescription,
                    theme.id === "dark" && { color: "#ccc" },
                  ]}
                >
                  {theme.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            ℹ️ Bilgi
          </Text>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDark ? "#3a3a3a" : "#e3f2fd" },
            ]}
          >
            <Text
              style={[styles.infoText, { color: isDark ? "#ccc" : "#666" }]}
            >
              Tema değişikliği anında aktif olur.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 30,
  },
  backButton: {
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  placeholder: {
    width: 38, // backButton ile aynı genişlik
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: "47%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedColorOption: {
    borderColor: "#1782c9ff",
    borderWidth: 3,
  },
  colorPreview: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  colorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  colorDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  infoCard: {
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1782c9ff",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
