import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const normalize = (s: string | null) => (s ?? "").normalize("NFKC").trim();

export default function PasswordScreen() {
  const {
    backgroundColor,
    textColor,
    primaryColor,
    buttonColor,
    buttonTextColor,
    inputBackground,
    borderColor,
    isDark,
  } = useTheme();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFontsAndPassword = async () => {
      try {
        await Font.loadAsync({
          "GreatVibes-Regular": require("../assets/fonts/GreatVibes-Regular.ttf"),
        });
        setFontLoaded(true);

        const stored = await AsyncStorage.getItem("user_password");
        setSavedPassword(stored);
      } catch (err) {
        console.error("Error loading font or password:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFontsAndPassword();
  }, []);

  const handleSubmit = async () => {
    const input = normalize(password);
    const stored = normalize(savedPassword);

    if (!savedPassword) {
      await AsyncStorage.setItem("user_password", input);
      await AsyncStorage.setItem("current_session_password", input);
      router.push("/notes");
      return;
    }

    if (input && input === stored) {
      await AsyncStorage.setItem("current_session_password", input);
      router.push("/notes");
    } else {
      await AsyncStorage.setItem("current_session_password", "locked");
      router.push("/notes");
    }
  };

  if (loading || !fontLoaded) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Uygulama ismi */}
      <Text style={[styles.appName, { color: primaryColor }]}>
        Encrypt Dairy
      </Text>

      {/* Şifre input */}
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: inputBackground,
            borderColor: borderColor,
          },
        ]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder={
          savedPassword ? "Şifrenizi Girin" : "Yeni Şifre Belirleyin"
        }
        placeholderTextColor={isDark ? "#999" : "#666"}
      />

      {/* Buton */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: buttonTextColor }]}>
          {savedPassword ? "Giriş Yap" : "Şifre Kaydet"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },

  appName: {
    fontFamily: "GreatVibes-Regular",
    fontSize: 48,
    textAlign: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  text: { textAlign: "center" },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
