import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeColor, useTheme } from "../context/ThemeContext";

interface ColorPickerProps {
  label: string;
  value: string;
  onValueChange: (color: string) => void;
  description?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onValueChange,
  description,
}) => {
  const [showPalette, setShowPalette] = useState(false);

  const colorPalette = [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff",
    "#ff0080",
    "#ffffff",
    "#e6e6e6",
    "#cccccc",
    "#b3b3b3",
    "#999999",
    "#808080",
    "#666666",
    "#4d4d4d",
    "#333333",
    "#1a1a1a",
    "#000000",
    "#800000",
    "#ff4444",
    "#ff6b6b",
    "#ffa8a8",
    "#ffcccb",
    "#ffe5e5",
    "#008000",
    "#44ff44",
    "#6bff6b",
    "#a8ffa8",
    "#cbffcb",
    "#e5ffe5",
    "#000080",
    "#4444ff",
    "#6b6bff",
    "#a8a8ff",
    "#cbcbff",
    "#e5e5ff",
    "#800080",
  ];

  return (
    <View style={styles.modernColorPicker}>
      <View style={styles.colorPickerHeader}>
        <Text style={styles.colorLabel}>{label}</Text>
        {description && (
          <Text style={styles.colorDescription}>{description}</Text>
        )}
      </View>

      <View style={styles.colorInputRow}>
        <TouchableOpacity
          style={styles.colorPreviewContainer}
          onPress={() => setShowPalette(!showPalette)}
        >
          <View style={[styles.colorPreview, { backgroundColor: value }]} />
          <View style={styles.colorPreviewBorder} />
          <View style={styles.colorPickerIcon}>
            <MaterialIcons name="palette" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.modernColorInput}
          value={value}
          onChangeText={onValueChange}
          placeholder="#ffffff"
          maxLength={7}
          autoCapitalize="none"
        />
      </View>

      {showPalette && (
        <View style={styles.colorPalette}>
          <Text style={styles.paletteTitle}>Renk Seç</Text>
          <View style={styles.paletteGrid}>
            {colorPalette.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paletteColor,
                  { backgroundColor: color },
                  value === color && styles.selectedPaletteColor,
                ]}
                onPress={() => {
                  onValueChange(color);
                  setShowPalette(false);
                }}
              >
                {value === color && (
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={
                      color === "#000000" || color === "#333333"
                        ? "#fff"
                        : "#000"
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closePaletteButton}
            onPress={() => setShowPalette(false)}
          >
            <Text style={styles.closePaletteText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface CustomThemeEditorProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({
  visible,
  onClose,
}) => {
  const {
    getCustomTheme,
    createCustomTheme,
    updateCustomTheme,
    setTheme,
    resetToDefault,
  } = useTheme();

  const [themeName, setThemeName] = useState("Özel Tema");
  const [themeDescription, setThemeDescription] =
    useState("Kendi özel temanız");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [buttonColor, setButtonColor] = useState("#1d4ed8");
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [inputBackground, setInputBackground] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#e2e8f0");

  useEffect(() => {
    const customTheme = getCustomTheme();
    if (customTheme) {
      setThemeName(customTheme.name);
      setThemeDescription(customTheme.description);
      setBackgroundColor(customTheme.backgroundColor);
      setTextColor(customTheme.textColor);
      setPrimaryColor(customTheme.primaryColor);
      setButtonColor(customTheme.buttonColor);
      setButtonTextColor(customTheme.buttonTextColor);
      setInputBackground(customTheme.inputBackground);
      setBorderColor(customTheme.borderColor);
    }
  }, [visible]);

  const handleSaveTheme = async () => {
    const themeData: Partial<ThemeColor> = {
      name: themeName,
      description: themeDescription,
      backgroundColor,
      textColor,
      primaryColor,
      buttonColor,
      buttonTextColor,
      inputBackground,
      borderColor,
    };

    const existingTheme = getCustomTheme();
    if (existingTheme) {
      await updateCustomTheme(themeData);
    } else {
      await createCustomTheme(themeData);
    }

    Alert.alert("Başarılı", "Özel tema kaydedildi!", [
      { text: "Tamam", onPress: onClose },
    ]);
  };

  const handlePreview = async () => {
    const themeData: Partial<ThemeColor> = {
      name: themeName + " (Önizleme)",
      description: themeDescription,
      backgroundColor,
      textColor,
      primaryColor,
      buttonColor,
      buttonTextColor,
      inputBackground,
      borderColor,
    };

    await createCustomTheme(themeData);
  };

  const handleReset = () => {
    Alert.alert(
      "Sıfırla",
      "Özel temayı sıfırlamak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: async () => {
            // Custom theme'ı sıfırla
            await resetToDefault();

            // Form değerlerini varsayılana döndür
            setThemeName("Özel Tema");
            setThemeDescription("Kendi özel temanız");
            setBackgroundColor("#ffffff");
            setTextColor("#1a1a1a");
            setPrimaryColor("#2563eb");
            setButtonColor("#1d4ed8");
            setButtonTextColor("#ffffff");
            setInputBackground("#ffffff");
            setBorderColor("#e2e8f0");

            Alert.alert(
              "Başarılı",
              "Özel tema sıfırlandı ve varsayılan tema aktif edildi.",
              [{ text: "Tamam", onPress: onClose }]
            );
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Modern Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <View style={styles.headerLeft}>
            <View
              style={[styles.headerIcon, { backgroundColor: primaryColor }]}
            >
              <MaterialIcons name="palette" size={24} color="#fff" />
            </View>
            <View>
              <Text style={[styles.title, { color: textColor }]}>
                Özel Tema Editörü
              </Text>
              <Text style={[styles.subtitle, { color: textColor + "80" }]}>
                Kendi temanı tasarla
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={buttonColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Renk Seçenekleri */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Renkler
            </Text>

            <ColorPicker
              label="Arka Plan"
              value={backgroundColor}
              onValueChange={setBackgroundColor}
              description="Ana sayfa arka plan rengi"
            />

            <ColorPicker
              label="Metin Rengi"
              value={textColor}
              onValueChange={setTextColor}
              description="Genel metin rengi"
            />

            <ColorPicker
              label="Ana Renk"
              value={primaryColor}
              onValueChange={setPrimaryColor}
              description="Başlıklar ve vurgular"
            />

            <ColorPicker
              label="Buton Rengi"
              value={buttonColor}
              onValueChange={setButtonColor}
              description="Eylem butonları"
            />

            <ColorPicker
              label="Buton Metin Rengi"
              value={buttonTextColor}
              onValueChange={setButtonTextColor}
              description="Buton içindeki metin"
            />

            <ColorPicker
              label="Girdi Arka Plan"
              value={inputBackground}
              onValueChange={setInputBackground}
              description="Metin girdi alanları"
            />

            <ColorPicker
              label="Kenar Rengi"
              value={borderColor}
              onValueChange={setBorderColor}
              description="Çerçeveler ve ayırıcılar"
            />
          </View>
        </ScrollView>

        {/* Alt Butonlar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.previewButton,
              { borderColor: buttonColor },
            ]}
            onPress={handlePreview}
          >
            <MaterialIcons name="visibility" size={20} color={buttonColor} />
            <Text style={[styles.buttonText, { color: buttonColor }]}>
              Önizleme
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              { backgroundColor: buttonColor },
            ]}
            onPress={handleSaveTheme}
          >
            <MaterialIcons name="save" size={20} color={buttonTextColor} />
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>
              Kaydet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.resetButton,
              { borderColor: buttonColor },
            ]}
            onPress={handleReset}
          >
            <MaterialIcons name="refresh" size={20} color={buttonColor} />
            <Text style={[styles.buttonText, { color: buttonColor }]}>
              Sıfırla
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: "95%",
    height: "70%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorPickerHeader: {
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  colorDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  colorInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "monospace",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  previewButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  resetButton: {
    backgroundColor: "transparent",
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },

  // Modern UI Styles
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  modernInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontWeight: "400",
  },
  modernSwitchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  switchInfo: {
    flex: 1,
  },
  switchDescription: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },

  // Modern Color Picker
  modernColorPicker: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  colorPreviewContainer: {
    position: "relative",
  },
  colorPreviewBorder: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  modernColorInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
    backgroundColor: "#fff",
  },

  // Color Picker Icon
  colorPickerIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Color Palette Styles
  colorPalette: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  paletteColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 3,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPaletteColor: {
    borderColor: "#2563eb",
    borderWidth: 3,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
  },
  closePaletteButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closePaletteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
});

export default CustomThemeEditor;
