// components/NoteItem.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import { decryptNote } from "../utils/crypto";

type NoteItemProps = {
  item: string;
  index: number;
  password: string;
  deleteNote: (index: number) => Promise<void>;
};

const NoteItem: React.FC<NoteItemProps> = ({ item, index, password, deleteNote }) => {
  const decrypted = decryptNote(item, password);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.text}>{decrypted}</Text>
      <TouchableOpacity onPress={() => deleteNote(index)}>
        <MaterialIcons name="delete-outline" size={26} color="red" />
      </TouchableOpacity>
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
    elevation: 4, // Android shadow
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default NoteItem;
