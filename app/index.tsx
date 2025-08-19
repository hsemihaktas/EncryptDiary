// app/password.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

const normalize = (s: string | null) => (s ?? "").normalize("NFKC").trim();

export default function PasswordScreen() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      // ilk kurulum → kaydet
      await AsyncStorage.setItem("user_password", input);
      Alert.alert("Şifre kaydedildi!");
      await AsyncStorage.setItem("current_session_password", input); // 🔹 Oturum şifresi
      router.push("/notes");
      return;
    }

    if (input && input === stored) {
      // doğru şifre
      await AsyncStorage.setItem("current_session_password", input); // 🔹 Oturum şifresi
      router.push("/notes");
    } else {
      // yanlış şifre → yine notes'a git ama kilitli
      await AsyncStorage.setItem("current_session_password", "locked"); // 🔹 Kilitli
      router.push("/notes");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {savedPassword ? "Şifrenizi Girin" : "Yeni Şifre Belirleyin"}
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Şifre"
      />

      <Button
        title={savedPassword ? "Giriş Yap" : "Şifre Kaydet"}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, textAlign: "center", marginBottom: 20, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15 },
});
