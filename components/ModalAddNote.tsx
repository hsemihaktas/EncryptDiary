import { Ionicons } from "@expo/vector-icons";
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
import LinedPaper from "./LinedPaper";

type ModalAddNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    text: string,
    imageUris?: string[],
    coverImageUri?: string
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

  useEffect(() => {
    if (visible) {
      setTitle("");
      setText("");
      setImageUris([]);
      setCoverImageUri(null);
      setCurrentImageIndex(0);
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
      coverImageUri || undefined
    );
    setTitle("");
    setText("");
    setImageUris([]);
    setCoverImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.paperWrapper}>
          <LinedPaper>
            {/* Kapak Fotoğrafı Alanı */}
            <View style={styles.coverImageSection}>
              <Text style={styles.sectionTitle}>Kapak Fotoğrafı</Text>
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

            {/* Başlık input */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "transparent",
                  color: "#000",
                  fontWeight: "bold",
                },
              ]}
              placeholder="Başlık"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />

            {/* Yeni not input */}
            <TextInput
              style={[
                styles.inputText,
                { backgroundColor: "transparent", color: "#000" },
              ]}
              placeholder="Yeni not..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              multiline
            />

            {/* Fotoğraf seçme ve önizleme */}
            <View style={styles.imageSection}>
              {/* Mevcut resimler */}
              {imageUris.length > 0 && (
                <View>
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

              {/* Resim ekleme butonu */}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={showImagePicker}
              >
                <Ionicons name="camera" size={24} color="#666" />
                <Text style={styles.addImageText}>
                  {imageUris.length > 0
                    ? "Başka Fotoğraf Ekle"
                    : "Fotoğraf Ekle"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Butonlar modalın en altında */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.save]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </LinedPaper>
        </View>
      </View>
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
  paperWrapper: {
    width: width * 0.85,
    height: height * 0.7,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
  },
  input: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 28,
    textAlignVertical: "top",
    marginBottom: 12,
    borderColor: "#ccc",
  },
  inputText: {
    flex: 1,
    paddingHorizontal: 28,
    textAlignVertical: "top",
    borderColor: "#ccc",
  },
  imageSection: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    minHeight: 80,
    maxHeight: 200,
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
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
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
    padding: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  addCoverImageText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 10,
  },
  cancel: { backgroundColor: "red" },
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "white" },
});

export default ModalAddNote;
