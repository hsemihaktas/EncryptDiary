import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import { decryptNote } from "../utils/crypto";

type NoteType = {
  encTitle: string;
  encContent: string;
};

type NoteItemProps = {
  item: NoteType;
  index: number;
  password: string;
  openEditModal: (index: number, text: string) => void; // detay sayfasına yönlendirme
};

const NoteItem: React.FC<NoteItemProps> = ({ item, index, password, openEditModal }) => {
  const [decryptedTitle, setDecryptedTitle] = useState<string>("");
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const decrypt = async () => {
      try {
        const title = item.encTitle
          ? await decryptNote(item.encTitle, password)
          : "Başlık yok";

        const content = item.encContent
          ? await decryptNote(item.encContent, password)
          : "";

        setDecryptedTitle(title);
        setDecryptedContent(content);
      } catch (err) {
        console.error("Decrypt error:", err, "Item:", item);
        setDecryptedTitle("🔒 Şifre çözülmedi");
        setDecryptedContent("");
      } finally {
        setLoading(false);
      }
    };
    decrypt();
  }, [item, password]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ marginVertical: 12 }}
        color={isDark ? "#fff" : "#000"}
      />
    );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: isDark ? "#1E1E1E" : "#fff", shadowColor: isDark ? "#000" : "#aaa" },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
      onPress={() =>
        openEditModal(index, decryptedTitle + "\n" + decryptedContent)
      } // detay sayfasına yönlendir
    >
      <Text
        style={[styles.title, { color: isDark ? "#fff" : "#111" }]}
        numberOfLines={1}
      >
        {decryptedTitle}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NoteItem;
