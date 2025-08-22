import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
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
  onSave: (title: string, text: string) => Promise<void>;
};

const { width, height } = Dimensions.get("window");

const ModalAddNote: React.FC<ModalAddNoteProps> = ({
  visible,
  onClose,
  onSave,
}) => {
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
        <View style={styles.paperWrapper}>
          <LinedPaper>
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
    marginTop: 24,
    marginBottom: 12,
    borderColor: "#ccc",
  },
  inputText: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 28,
    textAlignVertical: "top",
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
    margin: 10,
  },
  cancel: { backgroundColor: "red" },
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "white" },
});

export default ModalAddNote;
