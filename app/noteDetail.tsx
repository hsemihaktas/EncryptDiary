import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinedPaper from "../components/LinedPaper";
import { useNotes } from "../context/NotesContext";
import { decryptNote } from "../utils/crypto";

type LegacyNoteV0 = string; // eski sadece içerik
type LegacyNoteV1 = { encContent: string }; // ara sürüm
type NoteV2 = { encTitle: string; encContent: string; encImages?: string[] }; // yeni - çoklu fotoğraf desteği
type AnyNote = LegacyNoteV0 | LegacyNoteV1 | NoteV2;

export default function NoteDetailScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const noteIndex = Number(index);
  const { notes, editNote, deleteNote } = useNotes();

  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

          // Resimler varsa çözümle
          if ((n as NoteV2).encImages && (n as NoteV2).encImages!.length > 0) {
            console.log(
              "Found images to decrypt:",
              (n as NoteV2).encImages!.length
            );
            const decryptedImages: string[] = [];
            for (const encImage of (n as NoteV2).encImages!) {
              const decImage = await decryptNote(encImage, password);
              decryptedImages.push(decImage);
            }
            console.log("Decrypted images:", decryptedImages.length);
            setImageUris(decryptedImages);
            setCurrentImageIndex(0); // Yeni resimler yüklenince index'i sıfırla
          } else {
            console.log("No images found for this note");
            setImageUris([]);
            setCurrentImageIndex(0);
          }
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
      await editNote(
        noteIndex,
        title,
        noteText,
        sessionPassword,
        imageUris.length > 0 ? imageUris : undefined
      );
      setIsEditing(false);
    } catch (e) {
      console.error("Edit error:", e);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, result.assets[0].uri]);
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Uyarı", "Kamera izni gerekli!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, result.assets[0].uri]);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Fotoğraf Seç", "Fotoğrafı nereden seçmek istiyorsunuz?", [
      { text: "Galeri", onPress: pickImageFromGallery },
      { text: "Kamera", onPress: pickImageFromCamera },
      { text: "İptal", style: "cancel" },
    ]);
  };

  const removeImage = (index: number) => {
    const newImageUris = imageUris.filter((_, i) => i !== index);
    setImageUris(newImageUris);
    // Eğer mevcut index'ten sonra bir resim silindiyse, index'i güncelle
    if (index <= currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleImageScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const containerWidth = event.nativeEvent.layoutMeasurement.width;
    const contentWidth = event.nativeEvent.contentSize.width;
    const imageWidth = 162; // 150 + 12 margin

    // Daha hassas scroll pozisyonu hesaplama
    let index = Math.round(scrollPosition / imageWidth);

    // Eğer scroll pozisyonu son %20'lik dilimde ise, son resimi göster
    const scrollPercentage = scrollPosition / (contentWidth - containerWidth);
    if (scrollPercentage > 0.8) {
      index = imageUris.length - 1;
    }

    // Index'i sınırlar içinde tut
    const finalIndex = Math.max(0, Math.min(index, imageUris.length - 1));
    setCurrentImageIndex(finalIndex);
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
    <View style={[styles.container]}>
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

            {/* Fotoğraf bölümü */}
            {(imageUris.length > 0 || isEditing) && (
              <View style={styles.imageSection}>
                {imageUris.length > 0 && (
                  <View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.imageList}
                      onScroll={handleImageScroll}
                      scrollEventThrottle={16}
                      contentContainerStyle={{ paddingRight: 12 }}
                    >
                      {imageUris.map((item, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <Image
                            source={{ uri: item }}
                            style={styles.noteImage}
                          />
                          {isEditing && canEdit && (
                            <TouchableOpacity
                              style={styles.removeImageBtn}
                              onPress={() => removeImage(index)}
                            >
                              <MaterialIcons
                                name="close"
                                size={20}
                                color="#fff"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </ScrollView>

                    {/* Progress Bar */}
                    {imageUris.length > 1 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          {imageUris.map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.progressDot,
                                index === currentImageIndex &&
                                  styles.progressDotActive,
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={styles.progressText}>
                          {currentImageIndex + 1} / {imageUris.length}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {isEditing && canEdit && (
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={showImagePicker}
                  >
                    <MaterialIcons name="camera-alt" size={24} color="#666" />
                    <Text style={styles.addImageText}>
                      {imageUris.length > 0
                        ? "Başka Fotoğraf Ekle"
                        : "Fotoğraf Ekle"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
const LINE_HEIGHT = 28;

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
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    lineHeight: 30,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: LINE_HEIGHT,
    letterSpacing: 0.3,
  },
  imageSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  imageList: {
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginRight: 12,
  },
  noteImage: {
    width: 150,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: "5%",
    backgroundColor: "rgba(255,0,0,0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  addImageText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 16,
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: "#007bff",
    transform: [{ scale: 1.2 }],
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  topButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 12,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
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
