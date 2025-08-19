import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";

type ModalEditNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
  initialValue: string;
};

const ModalEditNote: React.FC<ModalEditNoteProps> = ({ visible, onClose, onSave, initialValue }) => {
  const [text, setText] = useState(initialValue);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (visible) setText(initialValue);
  }, [visible, initialValue]);

  const handleSave = async () => {
    if (!text.trim()) return;
    await onSave(text.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={[styles.modal, { backgroundColor: isDark ? "#1E1E1E" : "#fff" }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? "#2A2A2A" : "#fff", color: isDark ? "#fff" : "#333", borderColor: isDark ? "#555" : "#ccc" }
            ]}
            placeholder="Notu düzenleyin..."
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
  container: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modal: { padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  input: { minHeight: 80, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: "top", marginBottom: 16 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, marginLeft: 10 },
  cancel: { backgroundColor: "red" }, // 🔹 kırmızı iptal butonu
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});

export default ModalEditNote;
