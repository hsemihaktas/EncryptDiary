import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type ModalEditNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
  initialValue: string;
};

const ModalEditNote: React.FC<ModalEditNoteProps> = ({ visible, onClose, onSave, initialValue }) => {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (visible) setText(initialValue);
  }, [visible, initialValue]);

  const handleSave = async () => {
    if (!text.trim()) return;
    await onSave(text.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.modal}>
          <TextInput
            style={styles.input}
            placeholder="Notu düzenleyin..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>İptal</Text>
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
  modal: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  input: { minHeight: 80, borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, textAlignVertical: "top", marginBottom: 16 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, marginLeft: 10 },
  cancel: { backgroundColor: "#eee" },
  save: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});

export default ModalEditNote;
