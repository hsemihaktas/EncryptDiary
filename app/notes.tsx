// NotesScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalAddNote from "../components/ModalAddNote";
import NoteItem from "../components/NoteItem";
import { encryptNote } from "../utils/crypto";

export default function NotesScreen() {
  const [notes, setNotes] = useState<string[]>([]);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await AsyncStorage.getItem("current_session_password");
      setSessionPassword(storedSession);
      setIsCorrect(storedSession !== "locked");
    };
    loadSession();
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      const stored = await AsyncStorage.getItem("SECURE_NOTES");
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    };
    loadNotes();
  }, []);

  const saveNotes = async (newNotes: string[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem("SECURE_NOTES", JSON.stringify(newNotes));
  };

  const handleAddNote = async (note: string) => {
    if (!sessionPassword || !isCorrect) return;
    const enc = await encryptNote(note, sessionPassword);
    const updated = [...notes, enc];
    await saveNotes(updated);
  };

  const deleteNote = async (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    await saveNotes(updated);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notlar</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={28} color="red" />
        </TouchableOpacity>
      </View>

      {/* Notes list */}
      <FlatList
        data={notes}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <NoteItem
            item={item}
            index={index}
            password={sessionPassword!}
            deleteNote={deleteNote}
          />
        )}
        ListEmptyComponent={<Text>Henüz not yok.</Text>}
      />

      {/* + FAB */}
      {isCorrect && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal */}
      <ModalAddNote
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
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
