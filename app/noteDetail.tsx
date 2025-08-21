import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
    <View style={[styles.container, { backgroundColor: "#f0e6d2" }]}>
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
      <ImageBackground
        source={require("../assets/images/paper_texture.png")}
        style={{
          width: "100%",
          minHeight: "70%",
          marginVertical: 20,
        }}
        imageStyle={{
          resizeMode: "cover", // resmi tamamen kaplasın
          width: "100%",
        }}
      >
        <View style={{ flex: 1, padding: 20 }}>
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
            editable={isEditing && !!canEdit}
            value={loaded ? noteText : ""}
            onChangeText={setNoteText}
          />
        </View>
      </ImageBackground>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0e6d2",
    justifyContent: "center", // ortalama
    alignItems: "center", // ortalama
    paddingHorizontal: 20,
  },
  noteWrapper: {
    width: "100%",
    minHeight: "70%",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  noteBg: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 28,
    letterSpacing: 0.5,
    textTransform: "uppercase", // büyük harf
    textAlign: "center", // ortala
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
    lineHeight: 24,
    letterSpacing: 0.3,
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
