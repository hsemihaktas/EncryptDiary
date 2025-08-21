import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ModalAddNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, text: string) => Promise<void>;
};

const { width, height } = Dimensions.get("window");

const ModalAddNote: React.FC<ModalAddNoteProps> = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle("");
      setText("");
    }
  }, [visible]);

  const handleSave = async () => {
    if (!text.trim() && !title.trim()) return;
    await onSave(title.trim(), text.trim());
    setTitle("");
    setText("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ImageBackground
          source={require("../assets/images/paper_texture.png")}
          style={styles.modal}
          imageStyle={{ resizeMode: "cover" }}
        >
          {/* Başlık input */}
          <TextInput
            style={[styles.input, { backgroundColor: "transparent", color: "#000", fontWeight: "bold" }]}
            placeholder="Başlık"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />

          {/* Yeni not input */}
          <TextInput
            style={[styles.inputText, { backgroundColor: "transparent", color: "#000" }]}
            placeholder="Yeni not..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            multiline
          />

          {/* Butonlar modalın en altında */}
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
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
  modal: {
    width: width * 0.85,
    height: height * 0.7,
    padding: 20,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
    borderColor: "#ccc",
  },
  inputText: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
    borderColor: "#ccc",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 10,
  },
  cancel: { backgroundColor: "red" },
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "white" },
});

export default ModalAddNote;
