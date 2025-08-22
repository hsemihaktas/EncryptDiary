import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { decryptNote } from "../utils/crypto";

type NoteType = {
  encTitle: string;
  encContent: string;
};

type NoteItemProps = {
  item: NoteType;
  index: number;
  password: string;
  openEditModal: (index: number, text: string) => void;
};

const NoteItem: React.FC<NoteItemProps> = ({
  item,
  index,
  password,
  openEditModal,
}) => {
  const [decryptedTitle, setDecryptedTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Font.loadAsync({
          GreatVibes: require("../assets/fonts/GreatVibes-Regular.ttf"),
        });
        setFontLoaded(true);
      } catch (err) {
        console.error("Font load error:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const decrypt = async () => {
      try {
        const title = item.encTitle
          ? await decryptNote(item.encTitle, password)
          : "Başlık yok";
        setDecryptedTitle(title);
      } catch (err) {
        console.error("Decrypt error:", err, "Item:", item);
        setDecryptedTitle("🔒 Şifre çözülmedi");
      } finally {
        setLoading(false);
      }
    };
    decrypt();
  }, [item, password]);

  if (loading || !fontLoaded)
    return <ActivityIndicator style={{ marginVertical: 12 }} color="#000" />;

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => openEditModal(index, decryptedTitle)}
    >
      <ImageBackground
        source={require("../assets/images/cover_texture.png")}
        style={styles.card}
        imageStyle={styles.cardİmage}
      >
        <View style={styles.overlay} />
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={2}>
            {decryptedTitle}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 6,
    marginVertical: 8,
  },
  card: {
    width: 180,
    height: 290, // biraz daha dikey
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cardİmage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // tüm ImageBackground'ı kaplar
    backgroundColor: "rgba(0,0,0,0.4)", // siyah ve 0.2 transparan
    borderRadius: 12, // eğer card borderRadius varsa overlay de uyumlu olsun
  },
  titleWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "GreatVibes", // burası el yazısı
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textTransform: 'capitalize',
  },
});

export default NoteItem;
