import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import ModalAddNote from "../components/ModalAddNote";
import ModalEditNote from "../components/ModalEditNote";
import NoteItem from "../components/NoteItem";
import { encryptNote } from "../utils/crypto";

export default function NotesScreen() {
  const [notes, setNotes] = useState<string[]>([]);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await AsyncStorage.getItem(
        "current_session_password"
      );
      setSessionPassword(storedSession);
      setIsCorrect(storedSession !== "locked");
    };
    loadSession();
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      const stored = await AsyncStorage.getItem("SECURE_NOTES");
      if (stored) setNotes(JSON.parse(stored));
    };
    loadNotes();
  }, []);

  const saveNotes = async (newNotes: string[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem("SECURE_NOTES", JSON.stringify(newNotes));
  };

  const handleAddNote = async (note: string) => {
    if (!sessionPassword) return;
    const enc = await encryptNote(note, sessionPassword);
    await saveNotes([...notes, enc]);
    setAddModalVisible(false);
  };

  const handleDeleteNote = async (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    await saveNotes(updated);
  };

  const handleOpenEditModal = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
    setEditModalVisible(true);
  };

  const handleSaveEditedNote = async (newText: string) => {
    if (editingIndex === null || !sessionPassword) return;
    const enc = await encryptNote(newText, sessionPassword);
    const updated = [...notes];
    updated[editingIndex] = enc;
    await saveNotes(updated);
    setEditingIndex(null);
    setEditingText("");
    setEditModalVisible(false);
  };

  const handleLogout = () => router.push("/");

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        isDark ? styles.safeContainerDark : styles.safeContainerLight,
      ]}
    >
      <View style={[styles.header, { marginHorizontal: 25 }]}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textDark : styles.textLight,
          ]}
        >
          Notlar
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <NoteItem
            item={item}
            index={index}
            password={sessionPassword!}
            isCorrect={isCorrect}
            deleteNote={handleDeleteNote}
            openEditModal={handleOpenEditModal}
          />
        )}
        ListEmptyComponent={
          <Text style={isDark ? styles.textDark : styles.textLight}>
            Henüz not yok.
          </Text>
        }
      />

      {isCorrect && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAddModalVisible(true)}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      <ModalAddNote
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddNote}
      />
      <ModalEditNote
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEditedNote}
        initialValue={editingText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
  safeContainerLight: { backgroundColor: "#fff" },
  safeContainerDark: { backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  textLight: { color: "#000" },
  textDark: { color: "#fff" },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "transparent", // 🔹 artık arka plan yok
  },
  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
