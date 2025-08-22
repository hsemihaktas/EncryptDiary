import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import LinedPaper from "../components/LinedPaper";
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
          const decContent = await decryptNote(
            (n as LegacyNoteV1).encContent,
            password
          );
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
  const canEdit =
    sessionPassword && storedPassword && sessionPassword === storedPassword;

  return (
    <View style={[styles.container,]}>
      {/* Geri */}
      <TouchableOpacity
        style={[styles.backButton]}
        onPress={() => router.push("/notes")}
      >
        <MaterialIcons name="arrow-back" size={28} color="#007bff" />
      </TouchableOpacity>

      {/* Sağ üst butonlar sadece şifre eşleşiyorsa */}
      {canEdit && (
        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={[styles.topButton]}
            onPress={() => setConfirmVisible(true)}
            disabled={isDeleting}
          >
            <MaterialIcons name="delete-outline" size={28} color="red" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topButton]}
            onPress={handleEditToggle}
          >
            <MaterialIcons
              name={isEditing ? "save" : "edit"}
              size={28}
              color="#007bff"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Kağıt dokulu arkaplanlı kutu */}
      <View style={styles.noteWrapper}>
        <LinedPaper>
          <View
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingRight: 20,
              paddingLeft: 36,
            }}
          >
            {/* Başlık */}
            <TextInput
              style={[styles.titleInput, { color: "#000" }]}
              placeholder="Başlık"
              placeholderTextColor="#666"
              editable={isEditing && !!canEdit}
              value={loaded ? title : ""}
              onChangeText={setTitle}
            />

            {/* İçerik */}
            <TextInput
              style={[styles.input, { color: "#000" }]}
              multiline
              textAlignVertical="top"
              editable={isEditing && !!canEdit}
              value={loaded ? noteText : ""}
              onChangeText={setNoteText}
            />
          </View>
        </LinedPaper>
      </View>

      {/* Confirm Modal */}
      {canEdit && (
        <Modal
          transparent
          visible={confirmVisible}
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Bu notu silmek istiyor musun?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setConfirmVisible(false)}
                >
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
const LINE_HEIGHT = 28; // LinedPaper ile aynı olmalı

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noteWrapper: {
    width: "100%",
    minHeight: "70%",
    elevation: 6,
      borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fffef7",
  },
  // noteBg tamamen kalktı

  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop:15,
    lineHeight: 30,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: LINE_HEIGHT, // 👈 çizgilerle hizalama
    letterSpacing: 0.3,
  },

  topButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 12,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",

    elevation: 6,
  },
  disabledButton: { backgroundColor: "#8b0000", opacity: 0.9 },
  rightButtons: {
    position: "absolute",
    top: 80,
    right: 20,
    flexDirection: "row",
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
    zIndex: 10,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalText: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
