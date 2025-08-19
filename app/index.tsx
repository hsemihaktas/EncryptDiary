import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";

const normalize = (s: string | null) => (s ?? "").normalize("NFKC").trim();

export default function PasswordScreen() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const loadPassword = async () => {
      const stored = await AsyncStorage.getItem("user_password");
      setSavedPassword(stored);
      setLoading(false);
    };
    loadPassword();
  }, []);

  const handleSubmit = async () => {
    const input = normalize(password);
    const stored = normalize(savedPassword);

    if (!savedPassword) {
      await AsyncStorage.setItem("user_password", input);
      Alert.alert("Şifre kaydedildi!");
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

  if (loading) {
    return (
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <Text style={isDark ? styles.textDark : styles.textLight}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
        {savedPassword ? "Şifrenizi Girin" : "Yeni Şifre Belirleyin"}
      </Text>

      <TextInput
        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Şifre"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
      />

      <TouchableOpacity
        style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, isDark ? styles.buttonTextDark : styles.buttonTextLight]}>
          {savedPassword ? "Giriş Yap" : "Şifre Kaydet"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  containerLight: { backgroundColor: "#fff" },
  containerDark: { backgroundColor: "#121212" },

  title: { fontSize: 22, textAlign: "center", marginBottom: 20, fontWeight: "bold" },
  textLight: { color: "#000" },
  textDark: { color: "#fff" },

  input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 },
  inputLight: { borderColor: "#ccc", color: "#000", backgroundColor: "#fff" },
  inputDark: { borderColor: "#444", color: "#fff", backgroundColor: "#222" },

  button: { paddingVertical: 14, borderRadius: 12, alignItems: "center", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  buttonLight: { backgroundColor: "#007bff", shadowColor: "#007bff" },
  buttonDark: { backgroundColor: "#1E90FF", shadowColor: "#1E90FF" },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  buttonTextLight: { color: "#fff" },
  buttonTextDark: { color: "#fff" },
});
