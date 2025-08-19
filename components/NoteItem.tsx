import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import { decryptNote } from "../utils/crypto";

type NoteItemProps = {
  item: string;
  index: number;
  password: string;
  isCorrect: boolean;
  deleteNote: (index: number) => Promise<void>;
  openEditModal: (index: number, text: string) => void;
};

const NoteItem: React.FC<NoteItemProps> = ({ item, index, password, isCorrect, deleteNote, openEditModal }) => {
  const [decrypted, setDecrypted] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decrypt = async () => {
      const text = await decryptNote(item, password);
      setDecrypted(text);
      setLoading(false);
    };
    decrypt();
  }, [item, password]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 12 }} />;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.text}>{decrypted}</Text>

      {isCorrect && (
        <TouchableOpacity style={styles.icon} onPress={() => deleteNote(index)}>
          <MaterialIcons name="delete-outline" size={26} color="red" />
        </TouchableOpacity>
      )}

      {isCorrect && (
        <TouchableOpacity style={styles.icon} onPress={() => openEditModal(index, decrypted)}>
          <MaterialIcons name="edit" size={24} color="#007bff" />
        </TouchableOpacity>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  text: { flex: 1, fontSize: 16, color: "#333" },
  icon: { marginLeft: 10 },
});

export default NoteItem;
