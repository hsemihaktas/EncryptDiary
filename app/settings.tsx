import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
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

  const [resetModalVisible, setResetModalVisible] = useState(false);

  const handleThemeSelect = async (themeId: string) => {
    await setTheme(themeId);
  };

  const handleBack = () => {
    router.back();
  };

  const handlePasswordReset = async () => {
    try {
      // Tüm şifre ve session verilerini sil
      await AsyncStorage.removeItem("user_password");
      await AsyncStorage.removeItem("current_session_password");

      // Modal'ı kapat ve direkt ana sayfaya git
      setResetModalVisible(false);
      router.replace("/"); // Ana sayfaya yönlendir
    } catch (error) {
      Alert.alert("Hata", "Şifre sıfırlanırken bir hata oluştu.");
      setResetModalVisible(false);
    }
  };

  const showResetConfirmation = () => {
    setResetModalVisible(true);
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
            🔒 Güvenlik
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: isDark ? "#ccc" : "#666" },
            ]}
          >
            Şifre ve veri yönetimi
          </Text>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: isDark ? "#8b0000" : "#ff4444" },
            ]}
            onPress={showResetConfirmation}
          >
            <MaterialIcons name="warning" size={24} color="#fff" />
            <Text style={styles.dangerButtonText}>Şifreyi Sıfırla</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <Modal
        transparent
        visible={resetModalVisible}
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <MaterialIcons name="warning" size={48} color="#ff4444" />
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Şifreyi Sıfırla
            </Text>
            <Text
              style={[styles.modalText, { color: isDark ? "#ccc" : "#666" }]}
            >
              Bu işlem geri alınamaz!{"\n\n"}• Şifreniz sıfırlanacak{"\n"}•
              Giriş sayfasına yönlendirileceksiniz
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePasswordReset}
              >
                <Text style={styles.confirmButtonText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Danger button styles
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",

    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#ff4444",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
