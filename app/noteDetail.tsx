import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { AVAILABLE_FONTS } from "../constants/Fonts";
import { useNotes } from "../context/NotesContext";
import { useTheme } from "../context/ThemeContext";
import { getFontFamily } from "../utils/fontLoader";
// Artık decrypt'e gerek yok - NotesContext direkt veri sağlıyor

export default function NoteDetailScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const noteIndex = Number(index);
  const { notes, editNote, deleteNote } = useNotes();
  const { backgroundColor, primaryColor, buttonColor } = useTheme();

  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>("Nunito-Regular");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [fontPickerVisible, setFontPickerVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadSessionAndNote = async () => {
      const password = await AsyncStorage.getItem("current_session_password");
      setSessionPassword(password);

      const stored = await AsyncStorage.getItem("user_password"); // kullanıcı şifresi
      setStoredPassword(stored);

      // Yeni sistemde notlar direkt alınır (doğru şifre ise düz metin, yanlış ise şifreli)
      const note = notes[noteIndex];

      if (typeof noteIndex !== "number" || !note) {
        setLoaded(true);
        return;
      }

      // NotesContext'ten gelen veriyi direkt kullan
      setTitle(note.title || "");
      setNoteText(note.content || "");
      setImageUris(note.images || []);
      setCoverImageUri(note.coverImage || null);
      setFontFamily(note.fontFamily || "Nunito-Regular");
      setCurrentImageIndex(0);
      setLoaded(true);
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
        imageUris.length > 0 ? imageUris : undefined,
        coverImageUri || undefined, // kapak fotoğrafını gönder
        fontFamily
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

  const handleFontSelect = (fontValue: string) => {
    setFontFamily(fontValue);
    setFontPickerVisible(false);
  };

  const getSelectedFontName = () => {
    const font = AVAILABLE_FONTS.find((f) => f.value === fontFamily);
    return font ? font.name : "Nunito";
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

  // Kapak fotoğrafı yönetimi
  const pickCoverImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImageUri(result.assets[0].uri);
    }
  };

  const pickCoverImageFromCamera = async () => {
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
      setCoverImageUri(result.assets[0].uri);
    }
  };

  const showCoverImagePicker = () => {
    Alert.alert(
      "Kapak Fotoğrafı Seç",
      "Kapak fotoğrafını nereden seçmek istiyorsunuz?",
      [
        { text: "Galeri", onPress: pickCoverImageFromGallery },
        { text: "Kamera", onPress: pickCoverImageFromCamera },
        { text: "İptal", style: "cancel" },
      ]
    );
  };

  const removeCoverImage = () => {
    setCoverImageUri(null);
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
    <View style={[styles.container, { backgroundColor }]}>
      {/* Geri */}
      <TouchableOpacity
        style={[styles.backButton]}
        onPress={() => router.push("/notes")}
      >
        <MaterialIcons name="arrow-back" size={28} color={primaryColor} />
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
      <View
        style={[
          styles.noteWrapper,
          { marginTop: isEditing && canEdit ? 120 : 0 },
        ]}
      >
        <LinedPaper>
          <View
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingRight: 20,
              paddingLeft: 36,
            }}
          >
            {/* Kapak Fotoğrafı Düzenleme Alanı */}
            {isEditing && canEdit && (
              <View style={styles.coverImageSection}>
                {coverImageUri ? (
                  <View style={styles.coverImageContainer}>
                    <Image
                      source={{ uri: coverImageUri }}
                      style={styles.coverImagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeCoverImageButton}
                      onPress={removeCoverImage}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addCoverImageButton}
                    onPress={showCoverImagePicker}
                  >
                    <Ionicons name="image" size={28} color="#686868ff" />
                    <Text style={styles.addCoverImageText}>
                      Kapak Fotoğrafı Seç/Değiştir
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Başlık - sadece varsa veya düzenleme modunda göster */}
            {(title.trim() || isEditing) &&
              (isEditing && canEdit ? (
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      color: "#000",
                      fontFamily: getFontFamily(fontFamily),
                    },
                  ]}
                  placeholder="Başlık"
                  placeholderTextColor="#666"
                  editable={true}
                  value={loaded ? title : ""}
                  onChangeText={setTitle}
                />
              ) : title.trim() ? (
                <View style={styles.readModeTitle}>
                  <Text
                    style={[
                      styles.readModeTitleText,
                      {
                        fontFamily: getFontFamily(fontFamily),
                      },
                    ]}
                  >
                    {title}
                  </Text>
                </View>
              ) : null)}

            {/* İçerik */}
            {isEditing && canEdit ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: "#000",
                    fontFamily: getFontFamily(fontFamily),
                    marginTop: !title.trim() && !isEditing ? 11 : 0,
                  },
                ]}
                multiline
                textAlignVertical="top"
                editable={true}
                value={loaded ? noteText : ""}
                onChangeText={setNoteText}
                placeholder={
                  !title.trim() && !isEditing ? "" : "Not içeriği..."
                }
                placeholderTextColor="#666"
              />
            ) : (
              <ScrollView
                style={styles.readModeContent}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={[
                    styles.readModeText,
                    {
                      fontFamily: getFontFamily(fontFamily),
                    },
                  ]}
                >
                  {noteText}
                </Text>
              </ScrollView>
            )}

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
                    style={styles.addCoverImageButton}
                    onPress={showImagePicker}
                  >
                    <MaterialIcons name="camera-alt" size={24} color="#666" />
                    <Text style={styles.addCoverImageText}>
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

      {/* Font Seçici Düzenleme Alanı - LinedPaper dışında */}
      {isEditing && canEdit && (
        <View style={styles.fontSectionOutside}>
          <TouchableOpacity
            style={[styles.fontButtonOutside]}
            onPress={() => setFontPickerVisible(true)}
          >
            <MaterialIcons name="text-fields" size={24} color="#333" />
            <Text
              style={[
                styles.fontButtonTextOutside,
                {
                  fontFamily: getFontFamily(fontFamily),
                },
              ]}
            >
              {getSelectedFontName()}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      )}

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

      {/* Font Seçici Modal */}
      <Modal
        visible={fontPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFontPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.fontPickerOverlay}
          activeOpacity={1}
          onPress={() => setFontPickerVisible(false)}
        >
          <View style={styles.fontPickerContainer}>
            <View style={styles.fontPickerHeader}>
              <Text
                style={[
                  styles.fontPickerTitle,
                  {
                    fontFamily: getFontFamily(fontFamily),
                  },
                ]}
              >
                Font Seç - {getSelectedFontName()}
              </Text>
              <TouchableOpacity onPress={() => setFontPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.fontList}>
              {AVAILABLE_FONTS.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={[
                    styles.fontItem,
                    fontFamily === font.value && styles.selectedFontItem,
                  ]}
                  onPress={() => handleFontSelect(font.value)}
                >
                  <View style={styles.fontItemContent}>
                    <Text
                      style={[
                        styles.fontSampleText,
                        {
                          fontFamily: getFontFamily(font.value),
                        },
                      ]}
                    >
                      {font.name}
                    </Text>
                    <Text
                      style={[
                        styles.fontSubtext,
                        {
                          fontFamily: getFontFamily(font.value),
                        },
                      ]}
                    >
                      Örnek
                    </Text>
                  </View>
                  {fontFamily === font.value && (
                    <MaterialIcons name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 0,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "capitalize",
  },
  input: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  imageSection: {
    paddingTop: 16,
  },
  imageList: {
    marginBottom: 8,
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
  // Kapak fotoğrafı stilleri
  coverImageSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
  },

  coverImageContainer: {
    position: "relative",
    alignItems: "center",
  },
  coverImagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "contain",
  },
  removeCoverImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addCoverImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#686868ff",
    backgroundColor: "#f5f5f5",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  addCoverImageText: {
    marginLeft: 8,
    color: "#686868ff",
    fontSize: 14,
    fontWeight: "500",
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // Font picker modal stilleri
  fontPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fontPickerContainer: {
    width: "90%",
    maxHeight: "75%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  fontPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fontPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  fontList: {
    maxHeight: 450,
    paddingBottom: 8,
  },
  fontItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 70,
  },
  selectedFontItem: {
    backgroundColor: "#e3f2fd",
  },
  fontItemContent: {
    flex: 1,
    marginRight: 12,
    paddingRight: 8,
  },
  fontSampleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,

    flexWrap: "wrap",
  },
  fontSubtext: {
    fontSize: 11,
    color: "#666",

    flexWrap: "wrap",
  },

  // Font section outside LinedPaper styles
  fontSectionOutside: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },

  fontButtonOutside: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#686868ff",
    backgroundColor: "#f5f5f5",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  fontButtonTextOutside: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },

  // Okuma modu stilleri
  readModeTitle: {
    paddingVertical: 8,
  },
  readModeTitleText: {
    fontSize: 22,
    textAlign: "center",
    textTransform: "capitalize",
    color: "#000",
    fontWeight: "600",
  },
  readModeContent: {
    flex: 1,
  },
  readModeText: {
    fontSize: 16,

    letterSpacing: 0.3,
    color: "#000",
    paddingBottom: 20,
  },
});
