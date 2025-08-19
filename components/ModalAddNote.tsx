// ModalAddNote.tsx
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type ModalAddNoteProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
};

export default function ModalAddNote({ visible, onClose, onSave }: ModalAddNoteProps) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note);
    setNote(""); // reset
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Yeni Not</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Notunuzu yazın..."
            value={note}
            onChangeText={setNote} // sadece kendi state'ini günceller
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#ccc" }]} onPress={onClose}>
              <Text>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#007bff" }]} onPress={handleSave}>
              <Text style={{ color: "white" }}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 },
  content: { backgroundColor: "white", borderRadius: 12, width: "100%", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: "top", marginBottom: 15 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
});
