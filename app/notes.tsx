import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ModalAddNote from "../components/ModalAddNote";
import NoteItem from "../components/NoteItem";
import { useNotes } from "../context/NotesContext";
import { useTheme } from "../context/ThemeContext";

export default function NotesScreen() {
  const { notes, addNote, loadNotesWithPassword } = useNotes();
  const { backgroundColor, primaryColor, buttonColor, buttonTextColor } =
    useTheme();
  const router = useRouter();

  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadPasswords = async () => {
      const stored = await AsyncStorage.getItem("user_password");
      const session = await AsyncStorage.getItem("current_session_password");
      setStoredPassword(stored);
      setSessionPassword(session);

      // Şifreler yüklendikten sonra notları yükle
      if (session && stored) {
        await loadNotesWithPassword(session, stored);
      }
    };
    loadPasswords();
  }, [loadNotesWithPassword]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("current_session_password");
    router.replace("/");
  };

  const handleAddNote = async (
    title: string,
    text: string,
    imageUris?: string[],
    coverImageUri?: string,
    fontFamily?: string
  ) => {
    await addNote(title, text, imageUris, coverImageUri, fontFamily);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: primaryColor }]}>My Journal</Text>
        <View style={styles.headerButtons}>
          {/* Settings butonu - sadece doğru şifre girildiğinde */}
          {sessionPassword &&
            storedPassword &&
            sessionPassword === storedPassword && (
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                style={styles.settingsButton}
              >
                <MaterialIcons name="settings" size={28} color={buttonColor} />
              </TouchableOpacity>
            )}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={28} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.notesContainer}>
        {notes.map((item, index) => (
          <NoteItem
            key={index}
            item={item}
            index={index}
            openEditModal={(i) =>
              router.push({
                pathname: "/noteDetail",
                params: { index: i.toString() },
              })
            }
          />
        ))}
      </ScrollView>

      {/* Sağ alt + butonu sadece şifreler aynıysa */}
      {sessionPassword &&
        storedPassword &&
        sessionPassword === storedPassword && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: buttonColor }]}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add" size={28} color={buttonTextColor} />
          </TouchableOpacity>
        )}

      <ModalAddNote
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  header: { fontSize: 28, fontWeight: "bold" },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  settingsButton: {
    padding: 5,
  },
  logoutButton: { padding: 5 },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
