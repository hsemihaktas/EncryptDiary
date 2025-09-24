import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AVAILABLE_FONTS } from "../constants/Fonts";
import { getFontFamily } from "../utils/fontLoader";
import LinedPaper from "./LinedPaper";

type ModalAddNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    text: string,
    imageUris?: string[],
    coverImageUri?: string,
    fontFamily?: string
  ) => Promise<void>;
};

const { width, height } = Dimensions.get("window");

const ModalAddNote: React.FC<ModalAddNoteProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedFont, setSelectedFont] = useState("Nunito-Regular");
  const [fontPickerVisible, setFontPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setText("");
      setImageUris([]);
      setCoverImageUri(null);
      setCurrentImageIndex(0);
      setSelectedFont("System");
      setFontPickerVisible(false);
    }
  }, [visible]);

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

  // Kapak fotoğrafı için fonksiyonlar
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
    let index = scrollPosition / imageWidth;

    // Yarım resim geçtikten sonra bir sonraki resme geç
    index = Math.round(index);

    // Index'i sınırlar içinde tut
    const finalIndex = Math.max(0, Math.min(index, imageUris.length - 1));
    setCurrentImageIndex(finalIndex);
  };

  const handleSave = async () => {
    if (
      !text.trim() &&
      !title.trim() &&
      imageUris.length === 0 &&
      !coverImageUri
    )
      return;

    await onSave(
      title.trim(),
      text.trim(),
      imageUris.length > 0 ? imageUris : undefined,
      coverImageUri || undefined,
      selectedFont
    );
    setTitle("");
    setText("");
    setImageUris([]);
    setCoverImageUri(null);
    setSelectedFont("Nunito-Regular");
    onClose();
  };

  const handleFontSelect = (fontValue: string) => {
    setSelectedFont(fontValue);
    setFontPickerVisible(false);
  };

  const getSelectedFontName = () => {
    const font = AVAILABLE_FONTS.find((f) => f.value === selectedFont);
    return font ? font.name : "Nunito";
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Üst Grid - Butonlar ve Font Seçimi */}
        <View style={styles.topGrid}>
          {/* Butonlar */}
          <View style={styles.buttonArea}>
            <TouchableOpacity
              style={[styles.iconButton, styles.cancelIcon]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.saveIcon]}
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Font Seçimi */}
          <View style={styles.fontArea}>
            <TouchableOpacity
              style={styles.fontSelector}
              onPress={() => setFontPickerVisible(true)}
            >
              <MaterialIcons name="text-fields" size={20} color="#333" />
              <Text
                style={[
                  styles.fontSelectorText,
                  { fontFamily: getFontFamily(selectedFont) },
                ]}
              >
                {getSelectedFontName()}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color="#333"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Alt Grid - LinedPaper */}
        <View style={styles.bottomGrid}>
          <View style={styles.linedPaperContainer}>
            <LinedPaper>
              {/* Kapak Fotoğrafı Alanı - Sabit */}
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
                    <Ionicons name="image" size={32} color="#666" />
                    <Text style={styles.addCoverImageText}>
                      Kapak Fotoğrafı Yükle
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Başlık input - Sabit */}
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    backgroundColor: "transparent",
                    color: "#000",
                    fontWeight: "bold",
                    fontFamily: getFontFamily(selectedFont),
                  },
                ]}
                placeholder="Başlık"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
              />

              {/* Yeni not input - Scrollable */}
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    backgroundColor: "transparent",
                    color: "#000",
                    fontFamily: getFontFamily(selectedFont),
                  },
                ]}
                placeholder="Yeni not..."
                placeholderTextColor="#666"
                value={text}
                onChangeText={setText}
                multiline
                scrollEnabled={true}
                textAlignVertical="top"
                autoCorrect={false}
                returnKeyType="default"
                enablesReturnKeyAutomatically={false}
              />

              {/* Fotoğraf seçme ve önizleme - Sabit */}
              {imageUris.length > 0 && (
                <View style={styles.imageSection}>
                  <ScrollView
                    horizontal
                    style={styles.imageScrollContainer}
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleImageScroll}
                    scrollEventThrottle={50}
                  >
                    {imageUris.map((uri, index) => (
                      <View key={index} style={styles.imagePreviewContainer}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#ff4444"
                          />
                        </TouchableOpacity>
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
            </LinedPaper>
          </View>

          {/* Fotoğraf Ekle butonu - En altta sabit */}
          <TouchableOpacity
            style={styles.fixedAddImageButton}
            onPress={showImagePicker}
          >
            <Ionicons name="camera" size={24} color="#666" />
            <Text style={styles.addImageText}>
              {imageUris.length > 0 ? "Başka Fotoğraf Ekle" : "Fotoğraf Ekle"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
                    fontFamily: getFontFamily(selectedFont),
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
                    selectedFont === font.value && styles.selectedFontItem,
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
                      Bugün güzel bir gün 🌸
                    </Text>
                  </View>
                  {selectedFont === font.value && (
                    <MaterialIcons name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  topGrid: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    height: 100,
    zIndex: 10,
  },
  buttonArea: {
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  fontArea: {
    height: 50,
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  fontLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.5,
  },
  fontSelector: {
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
  fontSelectorText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "500",
    flex: 1,
  },
  bottomGrid: {
    position: "absolute",
    top: 170,
    left: 20,
    right: 20,
    bottom: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    overflow: "hidden",
    flexDirection: "column",
  },
  linedPaperContainer: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  fixedAddImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    margin: 8,
    borderWidth: 2,
    borderColor: "#686868ff",
    backgroundColor: "#f5f5f5",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  titleInput: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    textAlignVertical: "top",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 18,
    borderColor: "#ccc",
  },
  contentInput: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 8,
    textAlignVertical: "top",
    fontSize: 16,
    borderColor: "#ccc",
  },
  imageSection: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginBottom: 20,
  },
  imageScrollContainer: {
    marginBottom: 12,
  },
  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginRight: 12,
  },
  imagePreview: {
    width: 150,
    height: 110,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 10,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  addImageText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 16,
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
    marginHorizontal: 2,
  },
  progressDotActive: {
    backgroundColor: "#007bff",
    transform: [{ scale: 1.3 }],
  },
  progressText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  // Kapak fotoğrafı stilleri
  coverImageSection: {
    paddingHorizontal: 28,
    marginTop: 38,
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
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cancelIcon: { backgroundColor: "#ff4444" },
  saveIcon: { backgroundColor: "#007bff" },

  // Font seçici stilleri
  fontSection: {
    paddingHorizontal: 28,
  },
  fontButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  fontButtonText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
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
});

export default ModalAddNote;
