import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useNotes } from "../context/NotesContext";
import { decryptNote } from "../utils/crypto";

type LegacyNoteV0 = string; // eski sadece içerik
type LegacyNoteV1 = { encContent: string }; // ara sürüm
type NoteV2 = { encTitle: string; encContent: string }; // yeni
type AnyNote = LegacyNoteV0 | LegacyNoteV1 | NoteV2;

export default function NoteDetailScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const noteIndex = Number(index);
  const { notes, editNote, deleteNote } = useNotes();

  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  useEffect(() => {
    const loadSessionAndNote = async () => {
      const password = await AsyncStorage.getItem("current_session_password");
      setSessionPassword(password);

      const stored = await AsyncStorage.getItem("user_password"); // kullanıcı şifresi
      setStoredPassword(stored);

      const n: AnyNote | undefined = notes[noteIndex] as any;

      if (!password || typeof noteIndex !== "number" || !n) {
        setLoaded(true);
        return;
      }

      try {
        if (typeof n === "string") {
          const decContent = await decryptNote(n, password);
          setTitle("");
          setNoteText(decContent);
        } else if ("encContent" in n && !("encTitle" in n)) {
          const decContent = await decryptNote((n as LegacyNoteV1).encContent, password);
          setTitle("");
          setNoteText(decContent);
        } else if ("encTitle" in n && "encContent" in n) {
          const decTitle = (n as NoteV2).encTitle
            ? await decryptNote((n as NoteV2).encTitle, password)
            : "";
          const decContent = (n as NoteV2).encContent
            ? await decryptNote((n as NoteV2).encContent, password)
            : "";
          setTitle(decTitle);
          setNoteText(decContent);
        } else {
          throw new Error("Unknown note shape");
        }
      } catch (e) {
        console.warn("Decrypt error:", e);
        setTitle("");
        setNoteText("");
      } finally {
        setLoaded(true);
      }
    };

    loadSessionAndNote();
  }, [notes, noteIndex]);

  const handleSave = async () => {
    if (!sessionPassword) return;
    try {
      await editNote(noteIndex, title, noteText, sessionPassword);
      setIsEditing(false);
    } catch (e) {
      console.error("Edit error:", e);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  };

  const handleDelete = async () => {
    if (isNaN(noteIndex) || noteIndex < 0 || noteIndex >= notes.length) return;
    try {
      setIsDeleting(true);
      await deleteNote(noteIndex);
      router.replace("/notes");
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Şifre eşleşiyor mu kontrol
  const canEdit = sessionPassword && storedPassword && sessionPassword === storedPassword;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}>
      {/* Geri */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: "transparent", borderColor: isDark ? "#fff" : "#007bff" }]}
        onPress={() => router.push("/notes")}
      >
        <MaterialIcons name="arrow-back" size={28} color={isDark ? "#fff" : "#007bff"} />
      </TouchableOpacity>

      {/* Sağ üst butonlar sadece şifre eşleşiyorsa */}
      {canEdit && (
        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={[styles.topButton, isDeleting ? styles.disabledButton : { backgroundColor: "red" }]}
            onPress={() => setConfirmVisible(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="delete-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.topButton, { backgroundColor: "#007bff" }]} onPress={handleEditToggle}>
            <MaterialIcons name={isEditing ? "save" : "edit"} size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Başlık input */}
      <TextInput
        style={[
          styles.titleInput,
          {
            color: isDark ? "#fff" : "#000",
            backgroundColor: isDark ? "#1E1E1E" : "#fff",
          },
        ]}
        placeholder="Başlık"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        editable={isEditing && !!canEdit}
        value={loaded ? title : ""}
        onChangeText={setTitle}
      />

      {/* İçerik input */}
      <TextInput
        style={[
          styles.input,
          { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "#1E1E1E" : "#fff" },
        ]}
        multiline
        editable={isEditing && !!canEdit}
        value={loaded ? noteText : ""}
        onChangeText={setNoteText}
      />

      {/* Confirm Modal */}
      {canEdit && (
        <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Bu notu silmek istiyor musun?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setConfirmVisible(false)}>
                  <Text>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "red" }]}
                  onPress={() => {
                    setConfirmVisible(false);
                    handleDelete();
                  }}
                >
                  <Text style={{ color: "#fff" }}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 140, // title biraz daha aşağıda
    paddingHorizontal: 20,
    position: "relative",
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    minHeight: 200,
    fontSize: 16,
    padding: 16,
    borderRadius: 16,
    textAlignVertical: "top",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  topButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 12,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  disabledButton: { backgroundColor: "#8b0000", opacity: 0.9 },
  rightButtons: { position: "absolute", top: 80, right: 20, flexDirection: "row", zIndex: 10 },
  backButton: { position: "absolute", top: 80, left: 20, zIndex: 10, padding: 8, borderRadius: 50, borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%" },
  modalText: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
});
