import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

type ModalAddNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, text: string) => Promise<void>;
};

const ModalAddNote: React.FC<ModalAddNoteProps> = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.container, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View style={[styles.modal, { backgroundColor: isDark ? "#1E1E1E" : "#fff" }]}>
          {/* Başlık inputu */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#2A2A2A" : "#fff",
                color: isDark ? "#fff" : "#333",
                borderColor: isDark ? "#555" : "#ccc",
                fontWeight: "bold",
              },
            ]}
            placeholder="Başlık"
            placeholderTextColor={isDark ? "#888" : "#999"}
            value={title}
            onChangeText={setTitle}
          />

          {/* İçerik inputu */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#2A2A2A" : "#fff",
                color: isDark ? "#fff" : "#333",
                borderColor: isDark ? "#555" : "#ccc",
              },
            ]}
            placeholder="Yeni not..."
            placeholderTextColor={isDark ? "#888" : "#999"}
            value={text}
            onChangeText={setText}
            multiline
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: "white" }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
              <Text style={[styles.buttonText, { color: "white" }]}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  modal: { padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: "top", marginBottom: 16 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, marginLeft: 10 },
  cancel: { backgroundColor: "red" },
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});

export default ModalAddNote;
